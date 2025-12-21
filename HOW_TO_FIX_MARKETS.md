# How to Fix: Markets Not Showing Up

## The Problem

**Markets you create don't appear in the list** because:
1. The indexer is **NOT listening to blockchain events** (`RUN_INDEXER=0`)
2. Markets created before enabling the indexer won't be found (need historical scan)

## Quick Fix (For New Markets)

### Step 1: Enable Event Listening

**In Railway for `veyra-indexer` service:**

1. Go to **Variables** tab
2. Add/Update: `RUN_INDEXER` = `1`
3. Ensure these are set:
   - `SEPOLIA_RPC_URL` = Your RPC endpoint
   - `FACTORY` = `0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4`
   - `ORACLE_ADDRESS` = `0xa249E2981768f8B708027418625D5a0Ac85b8f1B`
   - `ADAPTER_ADDRESS` = `0x13179cdE5ff82f8ab183a5465445818c243118de`
4. **Redeploy** the service

### Step 2: Verify It's Working

1. **Check Logs:**
   - Railway → `veyra-indexer` → Logs
   - Should see: "Indexer listening on factory: 0x5DbDf..."
   - Should NOT see: "Indexer event listener disabled"

2. **Create a Test Market:**
   - Create a new market
   - Check logs for "MarketDeployed" event
   - Market should appear in list within 10 seconds

---

## Fix for Old Markets (Historical Scan)

If you created markets **before** enabling the indexer, they won't appear. You need to scan historical blocks.

### Option 1: Use Historical Scan Script

I've created a script to scan past blocks. To use it:

1. **SSH into indexer container** (or run locally):
   ```bash
   # Set environment variables
   export SEPOLIA_RPC_URL=your_rpc_url
   export FACTORY=0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4
   export SCAN_FROM_BLOCK=0  # Or set to Factory deployment block
   
   # Run scan
   cd indexer
   npm run scan-historical
   ```

2. **Or add to indexer startup:**
   - The indexer could auto-scan on first run
   - Need to add this functionality

### Option 2: Manual Database Entry (Quick)

If you know the market addresses, you can add them manually via API or SQL.

---

## Where Metrics Come From

### Current Metrics Explained:

1. **Total Predictions**: `activeMarkets * 1000 + 2847`
   - **Source:** Formula using real active markets + hardcoded base
   - **Real?** Partially - uses real active markets count

2. **Integrated Markets**: `markets.length`
   - **Source:** Real data from `/api/markets`
   - **Real?** Yes - but will be 0 if indexer not running

3. **Active Jobs**: `kpis.pendingJobs`
   - **Source:** From `/api/kpis` endpoint
   - **Real?** Yes - from indexer database

4. **Proofs Verified**: `99.8%`
   - **Source:** **Hardcoded** - Not real data
   - **Real?** No - needs calculation from attestations

5. **$VPO Staked**: `2.4M`
   - **Source:** **Hardcoded** - Not real data
   - **Real?** No - needs integration with staking contract

### To Get Real Metrics:

1. **Enable indexer** (`RUN_INDEXER=1`)
2. **Wait for data** to accumulate
3. **Metrics will update** from real API responses
4. **Some metrics** need additional data sources (staking, etc.)

---

## Verification Checklist

After enabling `RUN_INDEXER=1`:

- [ ] Indexer logs show "Indexer listening on factory"
- [ ] No "Indexer event listener disabled" message
- [ ] Create new market → appears in list
- [ ] `/api/markets` returns markets array
- [ ] Dashboard shows real market count

---

## Summary

**To see your markets:**
1. Set `RUN_INDEXER=1` in Railway
2. Create NEW markets (they'll be indexed automatically)
3. Old markets need historical scan

**Metrics:**
- Some are real (from API)
- Some are hardcoded (Proofs Verified, VPO Staked)
- Will improve as indexer collects data

