# Sepolia RPC URL Setup Guide

## Quick Answer

**For Railway `veyra-indexer` service, set:**

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

This is the **free public endpoint** - works immediately, no signup needed.

---

## All Options

### Option 1: Free Public RPC (Recommended for Testing)

**No API key needed - works immediately**

```
https://rpc.sepolia.org
```

**Pros:**
- ✅ Free
- ✅ No signup required
- ✅ Works immediately

**Cons:**
- ⚠️ Slower than paid options
- ⚠️ Rate limited (may fail under heavy load)

---

### Option 2: Alchemy (Recommended for Production)

**Requires free Alchemy account**

1. Sign up: https://www.alchemy.com/
2. Create new app → Select "Sepolia" network
3. Copy your API key
4. Use:
```
https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

**Pros:**
- ✅ Fast and reliable
- ✅ Higher rate limits
- ✅ Free tier available
- ✅ Good for production

**Cons:**
- ⚠️ Requires signup

---

### Option 3: Infura

**Requires free Infura account**

1. Sign up: https://www.infura.io/
2. Create project → Select "Sepolia" network
3. Copy your Project ID
4. Use:
```
https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

**Pros:**
- ✅ Fast and reliable
- ✅ Free tier available

**Cons:**
- ⚠️ Requires signup

---

## How to Set in Railway

1. Go to **Railway Dashboard**
2. Select **`veyra-indexer`** service
3. Click **Variables** tab
4. Add/Edit: `SEPOLIA_RPC_URL`
5. Paste your chosen URL
6. Click **Save**
7. Service will **automatically redeploy**

---

## Which Should You Use?

### For Testing/Development:
→ Use `https://rpc.sepolia.org` (free, no signup)

### For Production:
→ Use Alchemy or Infura (better performance)

---

## Verify It's Working

After setting the variable, check Railway logs:

1. Railway → `veyra-indexer` → **Logs**
2. Should see: "Indexer listening on factory: 0x..."
3. Should NOT see: "SEPOLIA_RPC_URL environment variable is required"

---

## Current Defaults in Code

- **Web app** defaults to: `https://rpc.sepolia.org`
- **Indexer** requires: `SEPOLIA_RPC_URL` to be set (no default)

---

## Quick Copy-Paste

**For Railway Variables:**

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

That's it! Just paste this in Railway and you're done.

