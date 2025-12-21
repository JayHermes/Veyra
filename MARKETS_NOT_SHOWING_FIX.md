# Why Markets Aren't Showing & How to Fix

## Problem: Markets You Create Don't Appear

### Root Cause
The indexer is **NOT listening to blockchain events** by default. It only indexes markets when `RUN_INDEXER=1` is set.

**Current Status:**
- `RUN_INDEXER=0` (disabled) - Indexer only serves API, doesn't listen to events
- When you create a market, the indexer doesn't detect it
- Markets only appear if they were indexed when `RUN_INDEXER=1` was active

### Solution: Enable Event Listening

**In Railway for `veyra-indexer` service:**

1. Go to **Variables** tab
2. Add/Update: `RUN_INDEXER` = `1`
3. Make sure these are also set:
   - `SEPOLIA_RPC_URL` = Your RPC endpoint
   - `FACTORY` = Factory contract address (`0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4`)
   - `ORACLE_ADDRESS` = Oracle address
   - `ADAPTER_ADDRESS` = Adapter address
4. Redeploy the service

**After enabling:**
- Indexer will listen for new `MarketDeployed` events
- New markets will automatically appear in the list
- Existing markets created while indexer was off won't appear (need historical scan)

---

## Problem: Historical Markets Missing

If you created markets before enabling the indexer, they won't be in the database.

### Solution: Scan Historical Blocks

The indexer needs to scan past blocks to find existing markets. This requires:
1. Knowing the block number when Factory was deployed
2. Scanning from that block to current
3. This is a one-time operation

**Option 1: Manual Database Entry (Quick Fix)**
- Add markets directly to the database via API or SQL

**Option 2: Historical Scan (Proper Fix)**
- Need to add historical scanning functionality to indexer
- Scan from Factory deployment block to current

---

## Where Metrics Come From

### Current Metrics (Mostly Hardcoded):

1. **Total Predictions**: `activeMarkets * 1000 + 2847`
   - Formula: Real active markets × 1000 + hardcoded 2847
   - Source: Mix of real and mock data

2. **Integrated Markets**: `markets.length`
   - Real data from `/api/markets`
   - Will be 0 if indexer not running or no markets indexed

3. **Active Jobs**: `kpis.pendingJobs`
   - From `/api/kpis` endpoint
   - Defaults to 0 or mock data if API fails

4. **Proofs Verified**: `99.8%`
   - **Hardcoded** - Not real data

5. **$VPO Staked**: `2.4M`
   - **Hardcoded** - Not real data

### How to Get Real Metrics:

1. **Enable indexer** (`RUN_INDEXER=1`)
2. **Wait for events** to be indexed
3. **Metrics will update** from real API data
4. **Some metrics** (like VPO Staked) need additional data sources

---

## Quick Fix Checklist

### To See Your Created Markets:

1. ✅ **Enable Indexer:**
   - Railway → `veyra-indexer` → Variables
   - Set `RUN_INDEXER=1`
   - Redeploy

2. ✅ **Verify Environment Variables:**
   - `SEPOLIA_RPC_URL` - Must be set
   - `FACTORY` - Must be set
   - `ORACLE_ADDRESS` - Should be set
   - `ADAPTER_ADDRESS` - Should be set

3. ✅ **Create New Market:**
   - After indexer is enabled, create a new market
   - It should appear within seconds

4. ⚠️ **Old Markets:**
   - Markets created before enabling indexer won't appear
   - Need historical scan or manual entry

---

## Verify It's Working

1. **Check Indexer Logs:**
   - Railway → `veyra-indexer` → Logs
   - Should see: "Indexer event listener enabled"
   - Should see: "MarketDeployed" events when markets are created

2. **Test API:**
   - Visit: `https://your-indexer-url.railway.app/markets`
   - Should return array of markets (may be empty initially)

3. **Create Test Market:**
   - Create a new market
   - Check logs for "MarketDeployed" event
   - Market should appear in list within 10 seconds (polling interval)

---

## Summary

**Why markets don't show:**
- Indexer not listening to events (`RUN_INDEXER=0`)

**How to fix:**
- Set `RUN_INDEXER=1` in Railway
- Ensure all required env vars are set
- Create new markets (they'll be indexed automatically)

**Metrics:**
- Some are real (from API)
- Some are hardcoded (Proofs Verified, VPO Staked)
- Will improve as indexer collects more data

