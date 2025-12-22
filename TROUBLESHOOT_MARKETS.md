# Troubleshooting: Markets Not Appearing After Creation

## Critical Issue Found

When you create a market, the transaction succeeds but the market address isn't being extracted from the transaction receipt. The indexer listens for `MarketDeployed` events, but there might be a timing or event detection issue.

## Step-by-Step Debugging

### Step 1: Verify Transaction Succeeded

1. **Get your transaction hash** from MetaMask after creating a market
2. **Check on Etherscan:**
   - Visit: `https://sepolia.etherscan.io/tx/YOUR_TX_HASH`
   - Verify transaction status is "Success"
   - Look for `MarketDeployed` event in the logs

**If no `MarketDeployed` event:**
- Transaction might have failed
- Contract might not have emitted the event
- Wrong factory contract address

### Step 2: Check Indexer Logs

**In Railway:**
1. Go to `veyra-indexer` service → **Logs**
2. Look for these messages when you create a market:

   ✅ **GOOD:**
   ```
   MarketDeployed event detected
   Market 0x... indexed
   ```

   ❌ **BAD:**
   - No `MarketDeployed` messages
   - Error messages about database
   - RPC connection errors

### Step 3: Test Indexer API Directly

**Get your indexer URL from Railway, then:**

1. **Check if markets exist:**
   ```
   https://your-indexer-url.railway.app/markets
   ```
   Should return JSON array

2. **Check if your specific market is there:**
   - Get market address from transaction receipt (see below)
   - Visit: `https://your-indexer-url.railway.app/markets/MARKET_ADDRESS`
   - Should return market data or 404

### Step 4: Extract Market Address from Transaction

**The market address is in the transaction receipt.** We need to extract it:

1. **From Etherscan:**
   - Go to transaction page
   - Look at "Logs" tab
   - Find `MarketDeployed` event
   - The `market` parameter is the market address

2. **From Code (we should add this):**
   - Parse transaction receipt
   - Find `MarketDeployed` event
   - Extract `market` address

## Potential Issues

### Issue 1: Indexer Not Receiving Events

**Symptoms:**
- Transaction succeeds
- No `MarketDeployed` in indexer logs
- Market not in database

**Possible Causes:**
1. `RUN_INDEXER=1` not set
2. Wrong `FACTORY` address
3. RPC connection issues
4. Event listener not attached

**Fix:**
- Verify `RUN_INDEXER=1` in Railway
- Verify `FACTORY` address matches deployed contract
- Check RPC URL is correct
- Restart indexer service

### Issue 2: Event Emitted But Not Indexed

**Symptoms:**
- `MarketDeployed` event visible on Etherscan
- No entry in indexer database

**Possible Causes:**
1. Database write error (check logs)
2. Event listener error (check logs)
3. Market address format mismatch

**Fix:**
- Check indexer logs for errors
- Verify database is writable
- Check address format (should be checksummed or lowercase)

### Issue 3: Market Indexed But Not Showing in UI

**Symptoms:**
- Market exists in database (API returns it)
- Not showing in UI

**Possible Causes:**
1. API route error
2. Frontend filtering
3. Mock data fallback hiding real data

**Fix:**
- Check browser console for errors
- Test API directly
- Check `MarketsManager` isn't returning mock data

## Quick Fix: Extract Market Address from Transaction

We should update the market creation to extract and display the market address from the transaction receipt. This will help verify the market was created correctly.

## Immediate Actions

1. **Check Railway Logs:**
   - Look for `MarketDeployed` events
   - Look for errors

2. **Test API:**
   - Visit `/markets` endpoint
   - Check if markets are there

3. **Verify Transaction:**
   - Check Etherscan for `MarketDeployed` event
   - Extract market address manually

4. **Check Environment:**
   - `RUN_INDEXER=1` set?
   - `FACTORY` address correct?
   - RPC URL working?

## Next Steps

I'll add code to extract the market address from the transaction receipt so you can verify it was created correctly.

