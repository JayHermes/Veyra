# Fix for Railway Web Service Build Failure

## The Problem
The web service build is failing because Railway needs to pass build arguments to the Dockerfile, or the build arguments need defaults.

## Solution 1: Set Build Arguments in Railway (Recommended)

In Railway dashboard for the `veyra-web` service:

1. Go to **Settings** → **Build**
2. Add these **Build Arguments**:
   ```
   NEXT_PUBLIC_INDEXER_URL=https://your-indexer-url.railway.app
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
   NEXT_PUBLIC_FACTORY_ADDRESS=your_address
   NEXT_PUBLIC_ORACLE_ADDRESS=your_address
   NEXT_PUBLIC_ADAPTER_ADDRESS=your_address
   NEXT_PUBLIC_TEST_TOKEN_ADDRESS=your_address
   ```

3. **Important:** Replace `https://your-indexer-url.railway.app` with your actual indexer service URL from Railway

4. Click **Deploy** or trigger a new deployment

## Solution 2: Use Environment Variables (Alternative)

Railway can also use environment variables. In the **Variables** tab:

1. Add all `NEXT_PUBLIC_*` variables
2. Railway will automatically pass them as build arguments during Docker build

## Solution 3: Updated Dockerfile (Already Done)

I've updated the Dockerfile to have default values for build arguments, so the build should work even without them. However, you still need to set them for the app to work correctly.

## Quick Steps:

1. **Get your indexer URL:**
   - Go to `veyra-indexer` service in Railway
   - Copy the public URL (e.g., `https://veyra-indexer-production.up.railway.app`)

2. **Set in web service:**
   - Go to `veyra-web` service
   - Settings → Build → Build Arguments
   - Set `NEXT_PUBLIC_INDEXER_URL` to your indexer URL
   - Add other required variables

3. **Redeploy:**
   - Click "Deploy" or push a new commit

## Common Build Errors:

**"Build failed" with no details:**
- Check build logs in Railway dashboard
- Look for specific error messages
- Common issues: missing dependencies, TypeScript errors, build timeout

**"Cannot find module" errors:**
- Ensure `pnpm-lock.yaml` is committed to git
- Check that all dependencies are in `package.json`

**Environment variable errors:**
- Make sure all `NEXT_PUBLIC_*` variables are set
- Use the indexer's public URL, not `http://indexer:4001`

## After Fix:

Once the build succeeds:
- Your web service will be online
- It will connect to the indexer service
- Both services will be publicly accessible

