# Quick Public Deployment

## 🚀 Fastest Option: Railway (5 minutes)

### Step 1: Sign Up
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

### Step 2: Deploy
1. Click "Deploy from GitHub repo"
2. Select `JayHermes/Veyra`
3. Railway will auto-detect `docker-compose.yml`

### Step 3: Set Environment Variables
In Railway dashboard, go to Variables and add:

**For Indexer Service:**
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
FACTORY=0x...
ORACLE_ADDRESS=0x...
ADAPTER_ADDRESS=0x...
```

**For Web Service:**
```
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_ADAPTER_ADDRESS=0x...
NEXT_PUBLIC_INDEXER_URL=https://your-indexer-service.railway.app
```

**Important:** After Railway assigns URLs, update `NEXT_PUBLIC_INDEXER_URL` to your indexer's public URL.

### Step 4: Deploy
- Railway will automatically build and deploy
- You'll get public URLs like:
  - Web: `https://veyra-web-production.up.railway.app`
  - Indexer: `https://veyra-indexer-production.up.railway.app`

---

## 🎯 Alternative: Render (Similar Process)

1. Go to https://render.com
2. New → Blueprint
3. Connect GitHub repo
4. Render will detect `render.yaml`
5. Set environment variables
6. Deploy!

---

## 📝 What You Need

Before deploying, make sure you have:
- ✅ Contract addresses (Factory, Oracle, Adapter)
- ✅ RPC URL (Alchemy, Infura, or public RPC)
- ✅ GitHub repository pushed (already done!)

---

## 🔧 After Deployment

1. **Update Indexer URL**: Once deployed, update `NEXT_PUBLIC_INDEXER_URL` in web service to point to your indexer's public URL

2. **Test**: 
   - Visit your web URL
   - Check indexer: `https://your-indexer-url/health`

3. **Enable Indexing** (Optional):
   - Set `RUN_INDEXER=1` in indexer environment variables
   - This will start listening to blockchain events

---

## 💡 Pro Tips

- Railway gives you a free $5 credit to start
- Render has a free tier
- Both auto-deploy on git push
- Both provide HTTPS automatically

---

## 🆘 Need Help?

See `PUBLIC_DEPLOYMENT.md` for detailed instructions for all platforms.


