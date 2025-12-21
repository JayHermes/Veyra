# Market Creation Troubleshooting Guide

## Complete Checklist - Verify Everything

### ✅ 1. Wallet Connection
**Check:**
- [ ] MetaMask (or another wallet) is installed
- [ ] Wallet is connected to the site
- [ ] Wallet shows your address in the UI

**If not connected:**
- Click "Connect Wallet" button
- Approve the connection in MetaMask

---

### ✅ 2. Network Configuration
**Check:**
- [ ] Wallet is on **Sepolia Testnet** (Chain ID: 11155111)
- [ ] Not on Mainnet or other networks

**How to check:**
- Look at MetaMask - should say "Sepolia" at the top
- If not, the site should prompt you to switch

**If wrong network:**
- The site should auto-prompt to switch
- Or manually switch in MetaMask: Settings → Networks → Sepolia

---

### ✅ 3. Environment Variables (Railway)
**Check these are set in Railway for `veyra-web`:**

**REQUIRED:**
- [ ] `NEXT_PUBLIC_INDEXER_URL` = Your indexer's Railway URL
  - Example: `https://veyra-indexer-production.up.railway.app`
  - ⚠️ **MUST be the public Railway URL, not localhost**

**RECOMMENDED:**
- [ ] `NEXT_PUBLIC_SEPOLIA_RPC_URL` = RPC endpoint
  - Default works: `https://rpc.sepolia.org`
  - Better: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

**OPTIONAL (have defaults):**
- [ ] `NEXT_PUBLIC_FACTORY_ADDRESS` = Factory contract
  - Default: `0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4`
- [ ] `NEXT_PUBLIC_ORACLE_ADDRESS` = Oracle contract
  - Default: `0xa249E2981768f8B708027418625D5a0Ac85b8f1B`
- [ ] `NEXT_PUBLIC_ADAPTER_ADDRESS` = Adapter contract
  - Default: `0x13179cdE5ff82f8ab183a5465445818c243118de`

**How to verify:**
1. Go to Railway → `veyra-web` service → Variables tab
2. Check all variables are set
3. If `NEXT_PUBLIC_INDEXER_URL` is wrong, fix it and redeploy

---

### ✅ 4. Contract Addresses
**Verify contracts are deployed:**
- [ ] Factory contract exists at the address
- [ ] Oracle contract exists at the address
- [ ] Adapter contract exists at the address

**How to check:**
- Visit: https://sepolia.etherscan.io/address/YOUR_ADDRESS
- Should show contract code, not "Contract not verified"

---

### ✅ 5. RPC Connection
**Check:**
- [ ] RPC URL is accessible
- [ ] Not rate-limited
- [ ] Returns valid responses

**Test:**
- Open browser console (F12)
- Check for RPC errors
- Look for "Failed to fetch" or network errors

---

### ✅ 6. Factory Contract Permissions
**Check:**
- [ ] Your wallet address has permission to create markets
- [ ] Factory contract allows public market creation
- [ ] No access control restrictions

**Common issues:**
- Factory might require admin role
- Check contract source code for access controls

---

### ✅ 7. Oracle Address Validation
**Check:**
- [ ] Oracle address is valid (0x followed by 40 hex chars)
- [ ] Oracle contract exists on Sepolia
- [ ] Oracle is compatible with Factory

**In CreateMarketDialog:**
- Default uses Gemini adapter: `0x13179cdE5ff82f8ab183a5465445818c243118de`
- Or Chainlink oracle: `0xa249E2981768f8B708027418625D5a0Ac85b8f1B`

---

### ✅ 8. Transaction Parameters
**Check form inputs:**
- [ ] Market question is filled
- [ ] Collateral address is valid ERC20 token
- [ ] End date/time is in the future (at least 3 minutes)
- [ ] Fee is valid (0-10000 basis points)

**Common errors:**
- "End time must be at least 3 minutes in the future"
- "Invalid collateral address"
- "Invalid oracle address"

---

### ✅ 9. Browser Console Errors
**Check browser console (F12):**
- [ ] No JavaScript errors
- [ ] No contract interaction errors
- [ ] No network errors

**Look for:**
- `Failed to get signer`
- `Network not supported`
- `Contract not found`
- `Transaction failed`

---

### ✅ 10. Indexer Connection
**Check:**
- [ ] Indexer service is online (Railway)
- [ ] `NEXT_PUBLIC_INDEXER_URL` points to correct indexer
- [ ] Indexer API is accessible

**Test:**
- Visit: `https://your-indexer-url.railway.app/health`
- Should return: `{"ok":true}`

---

## Common Error Messages & Fixes

### "Please connect your wallet"
**Fix:** Connect MetaMask or another wallet

### "Please switch to Sepolia network"
**Fix:** Switch network in MetaMask to Sepolia

### "Failed to get wallet signer"
**Fix:** 
- Refresh page
- Reconnect wallet
- Check MetaMask is unlocked

### "Invalid oracle address"
**Fix:**
- Use default oracle addresses from config
- Or provide valid custom oracle address

### "End time must be at least 3 minutes in the future"
**Fix:** Set end date/time to at least 3 minutes from now

### "Transaction failed" or "User rejected"
**Fix:**
- Check you have Sepolia ETH for gas
- Approve transaction in MetaMask
- Check contract permissions

### "Contract not found" or "Invalid address"
**Fix:**
- Verify contract addresses in Railway environment variables
- Check contracts are deployed on Sepolia
- Verify addresses are correct format (0x...)

---

## Step-by-Step Debug Process

1. **Open Browser Console (F12)**
   - Look for errors when clicking "Create Market"
   - Note any error messages

2. **Check Network Tab**
   - Look for failed API calls
   - Check RPC requests to Sepolia

3. **Verify Wallet**
   - Is wallet connected?
   - Is it on Sepolia?
   - Do you have Sepolia ETH?

4. **Check Railway Variables**
   - Go to Railway dashboard
   - Verify all environment variables
   - Especially `NEXT_PUBLIC_INDEXER_URL`

5. **Test Contract Addresses**
   - Visit Etherscan for each contract
   - Verify they exist and are verified

6. **Check Form Inputs**
   - All fields filled?
   - Valid addresses?
   - End time in future?

---

## Quick Test

Try creating a market with these exact values:
- **Question:** "Test Market"
- **Collateral:** `0x228727D028c45f9fD21f2232e0B3775c5CA972Cc` (test token)
- **End Date:** Tomorrow
- **End Time:** 23:59
- **Oracle:** Gemini (default)
- **Fee:** 100 (1%)

If this fails, check the browser console for the specific error.

---

## Still Not Working?

1. **Share the exact error message** from browser console
2. **Check Railway logs** for `veyra-web` service
3. **Verify contract addresses** on Etherscan
4. **Test RPC connection** manually
5. **Check wallet has Sepolia ETH** for gas fees

