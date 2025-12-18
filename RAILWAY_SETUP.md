# Railway Deployment Setup Guide

## The Issue
Railway is detecting your `package.json` and trying to use Railpack (Node.js buildpack) instead of Docker. We need to configure Railway to use Docker Compose.

## Solution: Deploy Services Separately

Railway works best when you deploy each service (indexer and web) as separate services. Here's how:

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Create First Service - Indexer:**
   - In Railway dashboard, click "New" → "Empty Service"
   - Name it "veyra-indexer"
   - Click "Add Service" → "GitHub Repo"
   - Select your repository
   - In the service settings:
     - **Root Directory:** Leave empty (or set to `/`)
     - **Dockerfile Path:** `indexer/Dockerfile`
     - **Docker Context:** `indexer`
   - Set environment variables (see below)
   - Railway will auto-detect the Dockerfile and deploy

2. **Create Second Service - Web:**
   - Click "New" → "Empty Service" in the same project
   - Name it "veyra-web"
   - Click "Add Service" → "GitHub Repo"
   - Select the same repository
   - In the service settings:
     - **Root Directory:** Leave empty
     - **Dockerfile Path:** `web/Dockerfile`
     - **Docker Context:** `web`
   - Set environment variables (see below)
   - **Important:** Set `NEXT_PUBLIC_INDEXER_URL` to your indexer service's public URL

### Option 2: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Create indexer service
railway service create veyra-indexer
railway link
railway variables set DOCKERFILE_PATH=indexer/Dockerfile
railway variables set DOCKER_CONTEXT=indexer

# Create web service
railway service create veyra-web
railway link
railway variables set DOCKERFILE_PATH=web/Dockerfile
railway variables set DOCKER_CONTEXT=web
```

### Environment Variables

**For Indexer Service:**
```
PORT=4001
RUN_INDEXER=0
SEPOLIA_RPC_URL=your_rpc_url
FACTORY=your_factory_address
ORACLE_ADDRESS=your_oracle_address
ADAPTER_ADDRESS=your_adapter_address
```

**For Web Service:**
```
PORT=3000
NEXT_PUBLIC_INDEXER_URL=https://your-indexer-service.railway.app
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_rpc_url
NEXT_PUBLIC_FACTORY_ADDRESS=your_factory_address
NEXT_PUBLIC_ORACLE_ADDRESS=your_oracle_address
NEXT_PUBLIC_ADAPTER_ADDRESS=your_adapter_address
```

**Important:** After the indexer deploys, copy its public URL and set it as `NEXT_PUBLIC_INDEXER_URL` in the web service.

### Option 3: Force Docker with Configuration

If Railway still tries to use Railpack:

1. In Railway dashboard, go to your service
2. Go to "Settings" → "Build"
3. Set **Build Command** to: `echo "Using Docker"`
4. Set **Start Command** to: (leave empty, Dockerfile CMD will be used)
5. Railway should detect the Dockerfile automatically

### Troubleshooting

**If Railway still uses Railpack:**
- Make sure Dockerfile exists in the service directory
- Check that Dockerfile path is set correctly in service settings
- Try deleting the service and recreating it
- Ensure `.railwayignore` and `nixpacks.toml` are in the repo root

**If build fails:**
- Check build logs in Railway dashboard
- Verify Dockerfile paths are correct
- Ensure all dependencies are in Dockerfile

### Quick Fix: Add to package.json

As a temporary workaround, you can add a start script that Railway will detect, but it will still try to use Docker if Dockerfiles are present:

```json
"scripts": {
  "start": "echo 'Use Docker deployment' && exit 1"
}
```

This tells Railway there's a start command, but it will fail gracefully and Railway should fall back to Docker.

---

## Recommended Approach

**Deploy services separately** - This gives you:
- Better control over each service
- Independent scaling
- Separate logs and monitoring
- Easier environment variable management

