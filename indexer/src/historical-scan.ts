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

	// RPC providers limit block range (usually 50,000 blocks)
	// Split scan into chunks to avoid "exceed maximum block range" error
	const MAX_BLOCK_RANGE = 45000; // Use slightly less than 50k to be safe
	const allEvents: any[] = [];
	let scanFrom = fromBlock;

	console.log(`Scanning in chunks of ${MAX_BLOCK_RANGE} blocks...`);

	while (scanFrom <= currentBlock) {
		const scanTo = Math.min(scanFrom + MAX_BLOCK_RANGE - 1, currentBlock);
		console.log(`Scanning blocks ${scanFrom} to ${scanTo}...`);

		try {
			const filter = factory.filters.MarketDeployed();
			const chunkEvents = await factory.queryFilter(filter, scanFrom, scanTo);
			allEvents.push(...chunkEvents);
			console.log(`Found ${chunkEvents.length} events in this chunk (total: ${allEvents.length})`);
		} catch (error: any) {
			console.error(`Error scanning blocks ${scanFrom}-${scanTo}:`, error.message);
			// Continue to next chunk even if one fails
		}

		scanFrom = scanTo + 1;
		
		// Small delay to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	const events = allEvents;
	console.log(`Found ${events.length} MarketDeployed events total`);

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

// Note: This file is imported by server.ts, so we don't run it directly
// If you need to run it standalone, use: node dist/historical-scan.js
// But since we're using ES modules, that check is removed to avoid import errors

