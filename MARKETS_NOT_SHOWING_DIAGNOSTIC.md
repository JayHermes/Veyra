# Markets Not Showing - Diagnostic Guide

## Quick Checklist

### 1. Is the Indexer Listening? ⚠️ **MOST COMMON ISSUE**

**Check Railway Logs:**
1. Go to Railway → `veyra-indexer` service → **Logs**
2. Look for one of these messages:

   ✅ **GOOD:** `"Indexer listening on factory: 0x5DbDf..."`
   
   ❌ **BAD:** `"Indexer event listener disabled (RUN_INDEXER != 1)"`

**If you see the BAD message:**
- Go to Railway → `veyra-indexer` → **Variables**
- Set `RUN_INDEXER` = `1`
- **Redeploy** the service

---

### 2. Are Required Environment Variables Set?

**In Railway `veyra-indexer` service, check these variables:**

- [ ] `RUN_INDEXER` = `1` ⚠️ **CRITICAL**
- [ ] `SEPOLIA_RPC_URL` = `https://rpc.sepolia.org` (or your RPC)
- [ ] `FACTORY` = `0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4`
- [ ] `ORACLE_ADDRESS` = `0xa249E2981768f8B708027418625D5a0Ac85b8f1B` (optional but recommended)
- [ ] `ADAPTER_ADDRESS` = `0x13179cdE5ff82f8ab183a5465445818c243118de` (optional but recommended)

**Missing any?** Add them and redeploy.

---

### 3. Test the API Directly

**Check if markets are in the database:**

1. Get your indexer URL from Railway (e.g., `https://veyra-indexer-production.up.railway.app`)
2. Visit: `https://your-indexer-url.railway.app/markets`
3. Should return JSON array of markets

**If empty array `[]`:**
- Markets haven't been indexed yet
- Either indexer wasn't running when markets were created
- Or no markets have been created yet

**If error:**
- Check Railway logs for errors
- Verify RPC URL is working

---

### 4. When Was the Market Created?

**Important:** Markets created **BEFORE** enabling `RUN_INDEXER=1` won't appear automatically.

**Solutions:**

**Option A: Create a NEW market** (easiest)
- After setting `RUN_INDEXER=1` and redeploying
- Create a new market
- It should appear within seconds

**Option B: Historical Scan** (for old markets)
- Run the historical scan script to backfill old markets
- See `HOW_TO_FIX_MARKETS.md` for instructions

---

### 5. Check Web App API Connection

**Verify web app can reach indexer:**

1. Open browser console (F12)
2. Go to Markets page
3. Look for errors like:
   - `Failed to fetch markets`
   - `Network error`
   - `CORS error`

**If errors:**
- Check `NEXT_PUBLIC_INDEXER_URL` in Railway `veyra-web` service
- Should be your indexer's Railway URL
- Format: `https://your-indexer-url.railway.app`

---

### 6. Verify Market Was Created On-Chain

**Check if transaction succeeded:**

1. Get the transaction hash from MetaMask
2. Visit: `https://sepolia.etherscan.io/tx/YOUR_TX_HASH`
3. Verify transaction succeeded
4. Look for `MarketDeployed` event in the logs

**If transaction failed:**
- Market wasn't created, so it won't appear
- Check MetaMask for error messages

---

### 7. Check Indexer Logs for Errors

**Look for these in Railway logs:**

**Good signs:**
- ✅ `"Indexer listening on factory: 0x..."`
- ✅ `"MarketDeployed"` events when creating markets
- ✅ No error messages

**Bad signs:**
- ❌ `"SEPOLIA_RPC_URL environment variable is required"`
- ❌ `"FACTORY environment variable is required"`
- ❌ `"Error connecting to RPC"`
- ❌ `"Failed to start indexer event listener"`

**If you see errors:**
- Fix the environment variable mentioned
- Redeploy

---

## Step-by-Step Fix

### Step 1: Enable Indexer
```
Railway → veyra-indexer → Variables
RUN_INDEXER = 1
```

### Step 2: Set Required Variables
```
SEPOLIA_RPC_URL = https://rpc.sepolia.org
FACTORY = 0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4
```

### Step 3: Redeploy
- Railway will auto-redeploy when you save variables
- Or manually trigger redeploy

### Step 4: Verify in Logs
- Check logs for: `"Indexer listening on factory"`

### Step 5: Create Test Market
- Create a new market
- Check logs for: `"MarketDeployed"` event
- Market should appear in list within 10 seconds

---

## Common Issues

### Issue: "Indexer event listener disabled"
**Fix:** Set `RUN_INDEXER=1` in Railway

### Issue: Empty markets array `[]`
**Possible causes:**
1. Indexer not running when markets were created
2. No markets created yet
3. Wrong factory address

**Fix:**
- Enable indexer
- Create new market
- Or run historical scan

### Issue: "Failed to fetch markets"
**Possible causes:**
1. Wrong `NEXT_PUBLIC_INDEXER_URL`
2. Indexer service down
3. CORS issue

**Fix:**
- Check indexer URL is correct
- Verify indexer is running
- Check Railway logs

### Issue: Markets created before enabling indexer
**Fix:**
- Create new markets (they'll be indexed)
- Or run historical scan for old markets

---

## Still Not Working?

1. **Share Railway logs** from `veyra-indexer` service
2. **Share API response** from `/markets` endpoint
3. **Share transaction hash** of market creation
4. **Check** all environment variables are set correctly

---

## Quick Test

**Run this in browser console on your deployed site:**

```javascript
fetch('/api/markets')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected:** Array of market objects
**If empty:** Markets not indexed yet
**If error:** API connection issue

