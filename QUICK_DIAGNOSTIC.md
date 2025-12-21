# Quick Diagnostic - Market Creation Issue

## Immediate Checks (Do These First)

### 1. Check Browser Console
**Press F12 → Console tab**
- Look for red error messages
- Copy any errors you see
- Common errors:
  - `Failed to get signer`
  - `Network not supported`
  - `Contract not found`

### 2. Check Wallet
- [ ] MetaMask installed?
- [ ] Wallet connected? (Should show address in UI)
- [ ] On Sepolia network? (Should say "Sepolia" in MetaMask)
- [ ] Have Sepolia ETH? (Need for gas fees)

### 3. Check Railway Environment Variables
**Go to Railway → `veyra-web` → Variables tab**

**MUST HAVE:**
- `NEXT_PUBLIC_INDEXER_URL` = `https://your-indexer-url.railway.app`
  - ⚠️ **This is the most common issue!**

**SHOULD HAVE:**
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` = `https://rpc.sepolia.org` (or Alchemy URL)

**OPTIONAL (have defaults):**
- Contract addresses (only set if using custom contracts)

### 4. Test Indexer Connection
**Visit in browser:**
```
https://your-indexer-url.railway.app/health
```
**Should return:** `{"ok":true}`

If it doesn't work, your `NEXT_PUBLIC_INDEXER_URL` is wrong!

---

## Most Common Issues

### Issue #1: Wrong Indexer URL
**Symptom:** Can't connect to API, markets don't load
**Fix:** Set `NEXT_PUBLIC_INDEXER_URL` to your indexer's Railway URL

### Issue #2: Wrong Network
**Symptom:** "Please switch to Sepolia" error
**Fix:** Switch MetaMask to Sepolia testnet

### Issue #3: No Wallet Connection
**Symptom:** "Connect Wallet" button, can't create market
**Fix:** Click "Connect Wallet" and approve in MetaMask

### Issue #4: Invalid Contract Addresses
**Symptom:** "Contract not found" error
**Fix:** Verify contract addresses on Etherscan

### Issue #5: No Sepolia ETH
**Symptom:** Transaction fails, "insufficient funds"
**Fix:** Get Sepolia ETH from faucet

---

## What Error Do You See?

**Share the exact error message** and I can help fix it specifically!

Common places to find errors:
1. Browser console (F12)
2. MetaMask popup
3. Site error message (red text)
4. Railway logs

---

## Quick Test

1. Open site
2. Connect wallet (MetaMask)
3. Switch to Sepolia if needed
4. Click "Create Market"
5. Fill form:
   - Question: "Test"
   - Collateral: `0x228727D028c45f9fD21f2232e0B3775c5CA972Cc`
   - End: Tomorrow 23:59
   - Oracle: Gemini (default)
6. Click "Create Market"
7. **What happens?** (Share the result)

