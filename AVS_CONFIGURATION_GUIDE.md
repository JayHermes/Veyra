# AVS Service Configuration Guide

This guide explains how to complete the remaining configuration tasks for your AVS service.

## Status Summary

✅ **Code Issues**: All fixed - error handling improved, better guidance added  
⚠️ **Configuration Tasks**: Need to be completed manually (see below)

---

## 1. Register Operator to AVS

**Status**: ❌ Not done - requires manual action

**Why it's needed**: The operator address must be registered with the AVS contract to submit attestations.

**How to do it**:

### Option A: Using Hardhat Script (Recommended)

1. Navigate to protocol directory:
   ```bash
   cd protocol
   ```

2. Set environment variables:
   ```bash
   export OPERATOR_ADDRESS=0xYourOperatorAddress
   # Or use the address from AVS_PRIVATE_KEY
   ```

3. Run registration script:
   ```bash
   npx hardhat run scripts/register-operator-sepolia.ts --network sepolia
   ```

**Note**: This requires:
- Deployment config file at `protocol/deployments/sepolia.json`
- Admin access to the AllocationManager contract
- Network configured in `hardhat.config.ts`

### Option B: Direct Contract Call

If you have access to the contracts, call directly:

```solidity
// Using ethers.js or web3
AllocationManager.registerOperatorToAVS(operatorAddress, avsId)
```

### Option C: Using EigenLayer Dashboard

1. Visit: https://app.eigenlayer.xyz
2. Connect your operator wallet
3. Navigate to AVSs section
4. Find "VeyraOracleAVS" and click "Opt-In"

**Check if registered**:
```bash
# The AVS service will log registration status on startup
# Or check contract:
adapter.isOperatorRegistered(operatorAddress)
```

---

## 2. Set FACTORY_ADDRESS (for Keeper Service)

**Status**: ❌ Not done - requires environment variable

**Why it's needed**: Enables automated market resolution (Keeper service) that automatically closes and resolves markets when they end.

**How to do it**:

### In Railway:

1. Go to your AVS service in Railway dashboard
2. Navigate to **Variables** tab
3. Add new variable:
   - **Key**: `FACTORY_ADDRESS`
   - **Value**: `0xYourMarketFactoryAddress`
   
   OR:
   
   - **Key**: `MARKET_FACTORY_ADDRESS`
   - **Value**: `0xYourMarketFactoryAddress`

4. Save and redeploy

### Find Your Factory Address:

The factory address should be:
- The same as `NEXT_PUBLIC_FACTORY_ADDRESS` in your web service
- Or check your deployment logs/contracts
- Or query from your MarketFactory contract

**Verify it's set**:
After redeploy, check logs for:
```
[Keeper] 🛡️  Starting Market Watcher with factory: 0x...
```

If you see:
```
[Keeper] ⚠️  FACTORY_ADDRESS not set. Keeper service disabled.
```

Then the variable is not set correctly.

---

## 3. Fix Pinata Authentication

**Status**: ⚠️ Partial - credentials may be incorrect

**Why it's needed**: IPFS uploads for attestations (optional but recommended).

**How to fix**:

### Step 1: Get Your Pinata API Keys

1. Visit: https://app.pinata.cloud/keys
2. Sign in or create account
3. Create new API key or use existing one
4. Copy:
   - **API Key** (JWT)
   - **Secret API Key**

### Step 2: Set in Railway

1. Go to AVS service in Railway
2. Navigate to **Variables** tab
3. Update:
   - **Key**: `PINATA_API_KEY`
   - **Value**: `YourPinataAPIKey`
   
   - **Key**: `PINATA_SECRET_API_KEY`
   - **Value**: `YourPinataSecretKey`

4. Save and redeploy

### Step 3: Verify

After redeploy, check logs for:
```
[AVS] ✅ Pinata authentication successful
```

If you see:
```
[AVS] ⚠️  Pinata authentication error: ...
```

Then:
- Check keys are correct (no extra spaces)
- Verify keys are active in Pinata dashboard
- Check key permissions (should have upload access)

**Note**: Service works without Pinata, but attestations won't be uploaded to IPFS.

---

## Quick Checklist

- [ ] **Operator Registered**: Run registration script or use EigenLayer dashboard
- [ ] **FACTORY_ADDRESS Set**: Add to Railway environment variables
- [ ] **Pinata Keys Verified**: Update PINATA_API_KEY and PINATA_SECRET_API_KEY in Railway

---

## Verification Commands

After completing configuration, verify:

### Check Operator Registration:
```bash
# In AVS logs, look for:
[AVS] ✅ Operator registered to AVS: 0x...
```

### Check Keeper Service:
```bash
# In AVS logs, look for:
[Keeper] 🛡️  Starting Market Watcher with factory: 0x...
```

### Check Pinata:
```bash
# In AVS logs, look for:
[AVS] ✅ Pinata authentication successful
```

---

## Troubleshooting

### "Operator not registered" error persists

- Verify operator address matches `AVS_PRIVATE_KEY` address
- Check AVS ID is set on adapter contract
- Ensure AllocationManager contract is accessible
- Try re-running registration script

### Keeper service still disabled

- Verify `FACTORY_ADDRESS` or `MARKET_FACTORY_ADDRESS` is set in Railway
- Check variable name is exact (case-sensitive)
- Redeploy service after setting variable
- Check logs for exact error message

### Pinata authentication fails

- Verify keys are correct (copy-paste carefully)
- Check keys haven't expired in Pinata dashboard
- Ensure keys have proper permissions
- Try regenerating keys in Pinata

---

## Summary

These are **configuration tasks**, not code bugs. The code is ready - you just need to:

1. **Register operator** → Use script or EigenLayer dashboard
2. **Set FACTORY_ADDRESS** → Add to Railway environment variables  
3. **Fix Pinata keys** → Update in Railway environment variables

All three can be done through Railway's environment variables UI (except operator registration which requires contract interaction).

