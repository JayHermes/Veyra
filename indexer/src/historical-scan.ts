/**
 * Historical block scanner to find markets created before indexer was enabled
 * Run this once to backfill the database with existing markets
 */

import { ethers } from "ethers";
import { db } from "./db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const FACTORY = process.env.FACTORY || "";

function loadAbi(relPath: string) {
	const p = path.join(process.cwd(), "..", "protocol", "artifacts", relPath);
	if (!fs.existsSync(p)) {
		throw new Error(`ABI file not found: ${p}`);
	}
	return JSON.parse(fs.readFileSync(p, "utf8")).abi;
}

/**
 * Scan historical blocks for MarketDeployed events
 * @param fromBlock - Starting block number (e.g., Factory deployment block)
 * @param toBlock - Ending block number (use "latest" for current)
 */
export async function scanHistoricalMarkets(fromBlock: number, toBlock: number | "latest" = "latest") {
	if (!RPC_URL) {
		throw new Error("SEPOLIA_RPC_URL environment variable is required");
	}
	if (!FACTORY) {
		throw new Error("FACTORY environment variable is required");
	}

	console.log(`Scanning blocks ${fromBlock} to ${toBlock} for MarketDeployed events...`);

	const factoryAbi = loadAbi("contracts/market/MarketFactory.sol/MarketFactory.json");
	const marketAbi = loadAbi("contracts/market/Market.sol/Market.json");
	
	const provider = new ethers.JsonRpcProvider(RPC_URL);
	const factory = new ethers.Contract(FACTORY, factoryAbi, provider);

	// Get current block if "latest"
	const currentBlock = toBlock === "latest" ? await provider.getBlockNumber() : toBlock;
	console.log(`Current block: ${currentBlock}, scanning from ${fromBlock}`);

	// Query MarketDeployed events
	const filter = factory.filters.MarketDeployed();
	const events = await factory.queryFilter(filter, fromBlock, currentBlock);

	console.log(`Found ${events.length} MarketDeployed events`);

	for (const event of events) {
		try {
			// Type guard: ensure this is an EventLog with args
			// In ethers v6, queryFilter returns (Log | EventLog)[]
			// We need EventLog which has the args property
			if (!("args" in event)) {
				console.error("Event missing args, skipping");
				continue;
			}
			// Now TypeScript knows event has args, but we need to assert the type
			// Use 'as any' to bypass strict typing since we've verified args exists
			const eventWithArgs = event as any;
			const { marketId, market, vault, question, endTime } = eventWithArgs.args;
			
			// Check if market already exists
			const existing = db.prepare(`SELECT address FROM markets WHERE address=?`).get(market);
			if (existing) {
				console.log(`Market ${market} already exists, skipping`);
				continue;
			}

			// Insert market
			db.prepare(
				`INSERT OR REPLACE INTO markets(address, marketId, question, endTime, oracle, vault, status, createdAt) VALUES (?,?,?,?,?,?,?,?)`
			).run(
				market,
				ethers.hexlify(marketId),
				question,
				Number(endTime),
				"",
				vault,
				0,
				eventWithArgs.blockNumber * 1000 // Approximate timestamp from block number
			);

			console.log(`Indexed market: ${market} - "${question}"`);

			// Also check for market status (Resolved, etc.)
			try {
				const marketContract = new ethers.Contract(market, marketAbi, provider);
				const [status, outcome] = await Promise.all([
					marketContract.status(),
					marketContract.outcome().catch(() => null)
				]);

				if (Number(status) === 2 && outcome !== null) {
					// Market is resolved
					db.prepare(`UPDATE markets SET status=?, outcome=? WHERE address=?`).run(2, Number(outcome), market);
					console.log(`  Market is resolved with outcome: ${outcome}`);
				} else if (Number(status) === 1) {
					// Market is pending resolution
					db.prepare(`UPDATE markets SET status=? WHERE address=?`).run(1, market);
					console.log(`  Market is pending resolution`);
				}
			} catch (err) {
				console.error(`  Error checking market status:`, err);
			}
		} catch (err) {
			console.error(`Error processing event:`, err);
		}
	}

	console.log(`Historical scan complete. Indexed ${events.length} markets.`);
	return events.length;
}

// If run directly, scan from a reasonable starting point
// ES module equivalent of require.main === module
// Check if this file is being run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('historical-scan.js')) {
	const FROM_BLOCK = process.env.SCAN_FROM_BLOCK 
		? parseInt(process.env.SCAN_FROM_BLOCK) 
		: 0; // Default: scan from block 0 (or set to Factory deployment block)

	scanHistoricalMarkets(FROM_BLOCK, "latest")
		.then((count) => {
			console.log(`Successfully indexed ${count} markets`);
			process.exit(0);
		})
		.catch((error) => {
			console.error("Historical scan failed:", error);
			process.exit(1);
		});
}

