# Public Deployment Guide

This guide will help you deploy Veyra to a public hosting service.

## Option 1: Railway (Recommended - Easiest)

Railway supports Docker Compose and makes deployment simple.

### Steps:

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `JayHermes/Veyra` repository

3. **Configure Environment Variables**
   In Railway dashboard, add these environment variables:
   ```
   SEPOLIA_RPC_URL=your_rpc_url
   FACTORY=your_factory_address
   ORACLE_ADDRESS=your_oracle_address
   ADAPTER_ADDRESS=your_adapter_address
   NEXT_PUBLIC_INDEXER_URL=https://your-app.railway.app:4001
   NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url
   NEXT_PUBLIC_FACTORY_ADDRESS=your_factory_address
   NEXT_PUBLIC_ORACLE_ADDRESS=your_oracle_address
   NEXT_PUBLIC_ADAPTER_ADDRESS=your_adapter_address
   ```

4. **Deploy**
   - Railway will automatically detect `docker-compose.yml`
   - It will build and deploy both services
   - You'll get public URLs for both services

### Railway Notes:
- Railway will assign public URLs automatically
- Update `NEXT_PUBLIC_INDEXER_URL` to point to your Railway indexer URL
- Database files are ephemeral (will reset on redeploy)

---

## Option 2: Render

Render also supports Docker Compose.

### Steps:

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `docker-compose.yml`

3. **Configure Services**
   - Render will create services for both `indexer` and `web`
   - Set environment variables in each service

4. **Deploy**
   - Render will build and deploy automatically
   - You'll get public URLs

---

## Option 3: Fly.io

Fly.io supports Docker Compose with `flyctl`.

### Steps:

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Initialize**
   ```bash
   fly launch
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

---

## Option 4: Vercel (Frontend) + Railway/Render (API)

Deploy frontend and backend separately.

### Frontend on Vercel:

1. **Connect Repository**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Set root directory to `web`

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_INDEXER_URL=https://your-api-url.com
   NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url
   NEXT_PUBLIC_FACTORY_ADDRESS=your_factory_address
   NEXT_PUBLIC_ORACLE_ADDRESS=your_oracle_address
   NEXT_PUBLIC_ADAPTER_ADDRESS=your_adapter_address
   ```

3. **Deploy**
   - Vercel will auto-detect Next.js and deploy

### API on Railway/Render:
- Deploy only the `indexer` service
- Use `docker-compose.yml` but only start the indexer service

---

## Environment Variables Reference

### Required for Indexer:
- `SEPOLIA_RPC_URL` - Ethereum Sepolia RPC endpoint
- `FACTORY` - Market factory contract address
- `ORACLE_ADDRESS` - Oracle contract address
- `ADAPTER_ADDRESS` - Adapter contract address

### Required for Web:
- `NEXT_PUBLIC_INDEXER_URL` - Public URL of your indexer API
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` - RPC endpoint for frontend
- `NEXT_PUBLIC_FACTORY_ADDRESS` - Factory contract address
- `NEXT_PUBLIC_ORACLE_ADDRESS` - Oracle contract address
- `NEXT_PUBLIC_ADAPTER_ADDRESS` - Adapter contract address

### Optional:
- `RUN_INDEXER` - Set to "1" to enable event listening
- `UMA_ADAPTER_ADDRESS` - UMA adapter address
- `GNOSIS_ADAPTER_ADDRESS` - Gnosis adapter address

---

## Important Notes

1. **Database Persistence**: The SQLite database in `indexer/data/` is ephemeral in most cloud deployments. Consider using a managed database service for production.

2. **CORS**: Make sure your indexer API allows CORS from your frontend domain.

3. **HTTPS**: Most platforms provide HTTPS automatically. Update your RPC URLs and API URLs accordingly.

4. **Ports**: Cloud platforms assign ports dynamically. Use environment variables for URLs instead of hardcoding.

---

## Quick Deploy Commands (Railway)

If using Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

---

## Troubleshooting

**Services not connecting:**
- Check that `NEXT_PUBLIC_INDEXER_URL` points to the correct public URL
- Verify CORS is enabled on the indexer
- Check environment variables are set correctly

**Build failures:**
- Ensure all dependencies are in `package.json`
- Check Docker build logs in platform dashboard
- Verify Dockerfile paths are correct

**Database issues:**
- Remember that local database files won't persist
- Consider migrating to PostgreSQL or another managed database


