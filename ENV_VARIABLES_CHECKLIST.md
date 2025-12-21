# Environment Variables Checklist for Railway

## ✅ Required Variables for `veyra-web` Service

### 1. NEXT_PUBLIC_INDEXER_URL (CRITICAL)
- **Status:** ⚠️ MUST BE SET
- **Value:** Your indexer's Railway public URL
- **Example:** `https://veyra-indexer-production.up.railway.app`
- **Check:** Go to Railway → `veyra-indexer` → Copy public URL
- **Why:** Without this, the web app can't connect to the API

### 2. NEXT_PUBLIC_SEPOLIA_RPC_URL
- **Status:** ✅ Has default (but recommended to set)
- **Default:** `https://rpc.sepolia.org`
- **Better:** `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
- **Why:** Better performance and reliability

### 3. NEXT_PUBLIC_FACTORY_ADDRESS
- **Status:** ✅ Has default
- **Default:** `0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4`
- **Set if:** Using custom factory contract
- **Check:** Verify on https://sepolia.etherscan.io/address/0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4

### 4. NEXT_PUBLIC_ORACLE_ADDRESS
- **Status:** ✅ Has default
- **Default:** `0xa249E2981768f8B708027418625D5a0Ac85b8f1B`
- **Set if:** Using custom oracle contract
- **Check:** Verify on https://sepolia.etherscan.io/address/0xa249E2981768f8B708027418625D5a0Ac85b8f1B

### 5. NEXT_PUBLIC_ADAPTER_ADDRESS
- **Status:** ✅ Has default
- **Default:** `0x13179cdE5ff82f8ab183a5465445818c243118de`
- **Set if:** Using custom adapter contract
- **Check:** Verify on https://sepolia.etherscan.io/address/0x13179cdE5ff82f8ab183a5465445818c243118de

---

## ✅ Required Variables for `veyra-indexer` Service

### 1. PORT
- **Status:** ✅ Auto-set by Railway
- **Value:** `4001`

### 2. RUN_INDEXER
- **Status:** Optional
- **Value:** `0` (disabled) or `1` (enabled)
- **Default:** `0`

### 3. SEPOLIA_RPC_URL
- **Status:** ⚠️ Should be set
- **Value:** Your RPC endpoint
- **Example:** `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

### 4. FACTORY
- **Status:** ✅ Has default
- **Default:** `0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4`

### 5. ORACLE_ADDRESS
- **Status:** ✅ Has default
- **Default:** `0xa249E2981768f8B708027418625D5a0Ac85b8f1B`

### 6. ADAPTER_ADDRESS
- **Status:** ✅ Has default
- **Default:** `0x13179cdE5ff82f8ab183a5465445818c243118de`

---

## 🔍 How to Verify in Railway

1. **Go to Railway Dashboard**
2. **Select `veyra-web` service**
3. **Click "Variables" tab**
4. **Check each variable:**

   **MUST HAVE:**
   - [ ] `NEXT_PUBLIC_INDEXER_URL` = Your indexer's Railway URL

   **SHOULD HAVE:**
   - [ ] `NEXT_PUBLIC_SEPOLIA_RPC_URL` = RPC endpoint

   **OPTIONAL (have defaults):**
   - [ ] Contract addresses (only if using custom contracts)

---

## ⚠️ Common Issues

### Issue: "Invalid oracle address" or "Review alert" not working
**Cause:** Wrong network (Mainnet instead of Sepolia)
**Fix:** 
1. The app should auto-switch to Sepolia
2. If not, manually switch in MetaMask
3. Make sure you're on Sepolia testnet

### Issue: Can't connect to indexer
**Cause:** `NEXT_PUBLIC_INDEXER_URL` is wrong or not set
**Fix:**
1. Get indexer URL from Railway
2. Set it in `veyra-web` variables
3. Redeploy

### Issue: Contract not found
**Cause:** Wrong contract addresses or wrong network
**Fix:**
1. Verify addresses on Etherscan (Sepolia)
2. Check you're on Sepolia network
3. Verify environment variables match deployed contracts

---

## ✅ Quick Verification

**Test these URLs:**
1. Indexer health: `https://your-indexer-url.railway.app/health`
   - Should return: `{"ok":true}`

2. Factory contract: `https://sepolia.etherscan.io/address/0x5DbDf19ee3FbF92ABbdBf2370b85A5C8971F3cD4`
   - Should show contract code

3. Oracle contract: `https://sepolia.etherscan.io/address/0xa249E2981768f8B708027418625D5a0Ac85b8f1B`
   - Should show contract code

4. Adapter contract: `https://sepolia.etherscan.io/address/0x13179cdE5ff82f8ab183a5465445818c243118de`
   - Should show contract code

---

## 📝 Summary

**Minimum Required:**
- `NEXT_PUBLIC_INDEXER_URL` in `veyra-web` service

**Recommended:**
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` for better performance

**Everything else has defaults that should work!**

