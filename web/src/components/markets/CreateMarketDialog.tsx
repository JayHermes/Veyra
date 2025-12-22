"use client";

import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMarket } from "@/lib/contracts/hooks";
import { useWallet } from "@/lib/wallet/walletContext";
import { CONTRACT_ADDRESSES, getCurrentNetwork, switchToSepolia } from "@/lib/contracts/config";
import { TEST_TOKEN_ADDRESS, getMarketFactoryContract, getSigner } from "@/lib/contracts/contracts";
import { parseContractError } from "@/lib/utils";
import { ethers } from "ethers";
import { Loader2, Plus } from "lucide-react";

interface CreateMarketDialogProps {
	onSuccess?: (marketAddress: string) => void;
}

export function CreateMarketDialog({ onSuccess }: CreateMarketDialogProps): React.ReactElement {
	const { isConnected, connect } = useWallet();
	const { createMarket, isLoading: isContractLoading, error: contractError } = useCreateMarket();
	
	const [open, setOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [collateralAddress, setCollateralAddress] = useState(TEST_TOKEN_ADDRESS);
	const [endDate, setEndDate] = useState("");
	const [endTime, setEndTime] = useState("");
	const [feeBps, setFeeBps] = useState("100"); // 1%
	const [oracleProvider, setOracleProvider] = useState("gemini");
	const [oracleAddress, setOracleAddress] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);


	const ORACLE_PROVIDERS = [
		{ id: "gemini", name: "Gemini LLM (AI Verified)" },
		{ id: "chainlink", name: "Chainlink (Manual/Admin)" },
		{ id: "custom", name: "Custom Oracle" },
	];

	// Update oracle address when provider changes
	useEffect(() => {
		// Use sepolia as default if network not detected yet
		const network = currentNetwork || "sepolia";
		
		if (oracleProvider === "chainlink") {
			const address = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES]?.VPOOracleChainlink || "";
			setOracleAddress(address);
		} else if (oracleProvider === "gemini") {
			const address = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES]?.VPOAdapter || "";
			setOracleAddress(address);
		} else {
			setOracleAddress("");
		}
	}, [oracleProvider, currentNetwork]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		
		if (!isConnected) {
			await connect();
			setIsLoading(false);
			return;
		}

		if (!question.trim() || !collateralAddress.trim() || !endDate || !endTime) {
			setError("Please fill in all required fields.");
			setIsLoading(false);
			return;
		}

		// Determine oracle address based on selection
		let finalOracleAddress = oracleAddress;
		
		// If oracle address is empty, try to get it from current network
		if (!finalOracleAddress) {
			const network = currentNetwork || "sepolia";
			if (oracleProvider === "chainlink") {
				finalOracleAddress = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES]?.VPOOracleChainlink || "";
			} else if (oracleProvider === "gemini") {
				finalOracleAddress = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES]?.VPOAdapter || "";
			}
		}
		
		if (!finalOracleAddress || !ethers.isAddress(finalOracleAddress)) {
			setError("Invalid oracle address. Please ensure your wallet is connected and on the correct network.");
			setIsLoading(false);
			return;
		}

		try {
			// Check and switch network BEFORE getting signer
			const network = await getCurrentNetwork();
			if (!network || network !== "sepolia") {
				setError("Please switch to Sepolia network. Switching now...");
				const switched = await switchToSepolia();
				if (!switched) {
					setError("Failed to switch network. Please manually switch to Sepolia in MetaMask.");
					setIsLoading(false);
					return;
				}
				// Wait a moment for network switch
				await new Promise(resolve => setTimeout(resolve, 1000));
				// Update current network
				const newNetwork = await getCurrentNetwork();
				setCurrentNetwork(newNetwork || "sepolia");
			}

			const signer = await getSigner();
			if (!signer) {
				setError("Wallet not connected or signer not available.");
				setIsLoading(false);
				return;
			}
			
			// Use sepolia network for contract
			const factory = getMarketFactoryContract(signer, "sepolia");
			
			// Always use createMarketWithOracle to support custom/Gemini oracles
			// Convert feeBps to number
			const fee = parseInt(feeBps) || 0;
			
			// Parse end time
			const endTimestamp = Math.floor(new Date(`${endDate}T${endTime}`).getTime() / 1000);
			const now = Math.floor(Date.now() / 1000);

			// Enforce at least 3 minutes in the future to prevent block timestamp race conditions
			if (endTimestamp < now + 180) {
				setError("End time must be at least 3 minutes in the future");
				setIsLoading(false);
				return;
			}
			
			console.log("Creating market with:", {
				collateral: collateralAddress,
				question,
				endTimestamp,
				fee,
				oracle: finalOracleAddress
			});

			const tx = await factory.createMarketWithOracle(
				collateralAddress,
				question,
				endTimestamp,
				fee,
				finalOracleAddress
			);
			
			setTxHash(tx.hash);
			const receipt = await tx.wait();
			
			// Extract market address from MarketDeployed event
			let marketAddress: string | null = null;
			if (receipt && receipt.logs) {
				try {
					const iface = factory.interface;
					const marketDeployedEvent = receipt.logs
						.map((log: any) => {
							try {
								return iface.parseLog(log);
							} catch {
								return null;
							}
						})
						.find((e: any) => e && e.name === "MarketDeployed");
					
					if (marketDeployedEvent && marketDeployedEvent.args) {
						// MarketDeployed event args: marketId, market, vault, question, endTime, feeBps, flatFee, feeRecipient
						marketAddress = marketDeployedEvent.args[1]; // market is the second argument
						console.log("✅ Market created at address:", marketAddress);
					} else {
						console.warn("⚠️ MarketDeployed event not found in receipt logs");
					}
				} catch (err) {
					console.error("❌ Error extracting market address from receipt:", err);
				}
			}
			
			setOpen(false);
			// Reset form
			setQuestion("");
			setCollateralAddress(TEST_TOKEN_ADDRESS); // Reset collateral to default
			setEndDate(""); // Will be reset by useEffect
			setEndTime(""); // Will be reset by useEffect
			setFeeBps("100"); // Reset to default
			setOracleProvider("gemini"); // Reset to default
			setOracleAddress(""); // Will be reset by useEffect
			
			// Pass market address if available, otherwise tx hash
			if (onSuccess) onSuccess(marketAddress || tx.hash);
		} catch (err: any) {
			console.error("Error creating market:", err);
			// Handle specific custom errors
			const msg = err.message || "";
			if (msg.includes("0x6f7eac26") || msg.includes("InvalidTime")) {
				setError("End time must be in the future (check your clock)");
			} else {
				setError(parseContractError(err));
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Set default end date to tomorrow and fetch current network
	useEffect(() => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const dateStr = tomorrow.toISOString().split("T")[0];
		setEndDate(dateStr);
		
		// Default time to 23:59
		setEndTime("23:59");

		// Fetch current network (with retry and default)
		const fetchNetwork = async () => {
			try {
				const network = await getCurrentNetwork();
				setCurrentNetwork(network || "sepolia"); // Default to sepolia if null
			} catch (error) {
				console.error("Error fetching network:", error);
				// Default to sepolia if network detection fails
				setCurrentNetwork("sepolia");
			}
		};

		// Try immediately, then retry after a short delay (for wallet initialization)
		fetchNetwork();
		const timeout = setTimeout(fetchNetwork, 500);
		
		return () => clearTimeout(timeout);
	}, []);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-2">
					<Plus className="h-4 w-4" />
					Create Market
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create New Prediction Market</DialogTitle>
					<DialogDescription>
						Create a new binary prediction market. Participants can trade long or short positions.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="question">Market Question</Label>
						<Input
							id="question"
							placeholder="e.g., Will BTC reach $100k by Dec 31, 2024?"
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="collateral">Collateral Token Address</Label>
						<Input
							id="collateral"
							placeholder="0x..."
							value={collateralAddress}
							onChange={(e) => setCollateralAddress(e.target.value)}
							required
							disabled={isLoading}
							pattern="^0x[a-fA-F0-9]{40}$"
							title="Valid Ethereum address (0x followed by 40 hex characters)"
						/>
						<p className="text-xs text-muted-foreground">
							ERC20 token address to use as collateral (e.g., USDC on Sepolia)
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="endDate">End Date</Label>
							<Input
								id="endDate"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								required
								disabled={isLoading}
								min={new Date().toISOString().split("T")[0]}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="endTime">End Time</Label>
							<Input
								id="endTime"
								type="time"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Oracle Provider</Label>
						<Select value={oracleProvider} onValueChange={setOracleProvider} disabled={isLoading || isContractLoading}>
							<SelectTrigger>
								<SelectValue placeholder="Select Oracle" />
							</SelectTrigger>
							<SelectContent>
								{ORACLE_PROVIDERS.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{oracleProvider === "custom" && (
						<div className="space-y-2">
							<Label htmlFor="oracleAddress">Custom Oracle Address</Label>
							<Input
								id="oracleAddress"
								placeholder="0x..."
								value={oracleAddress}
								onChange={(e) => setOracleAddress(e.target.value)}
								required
								disabled={isLoading || isContractLoading}
								pattern="^0x[a-fA-F0-9]{40}$"
								title="Valid Ethereum address (0x followed by 40 hex characters)"
							/>
						</div>
					)}

					{oracleProvider !== "custom" && (
						<div className="space-y-2">
							<Label>Oracle Address</Label>
							<div className="p-2 bg-muted rounded text-xs font-mono break-all">
								{oracleAddress || (currentNetwork ? "Loading..." : "Connect wallet to load address")}
							</div>
							{!oracleAddress && currentNetwork && (
								<p className="text-xs text-yellow-600 dark:text-yellow-400">
									Using default {currentNetwork} network addresses
								</p>
							)}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="feeBps">Fee (basis points, optional)</Label>
						<Input
							id="feeBps"
							type="number"
							placeholder="0"
							value={feeBps}
							onChange={(e) => setFeeBps(e.target.value)}
							min="0"
							max="10000"
							disabled={isLoading}
						/>
						<p className="text-xs text-muted-foreground">
							1 basis point = 0.01% (e.g., 100 = 1%)
						</p>
					</div>

					{error && (
						<div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
							{parseContractError(error)}
						</div>
					)}

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading || !isConnected}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : !isConnected ? (
								"Connect Wallet"
							) : (
								"Create Market"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

