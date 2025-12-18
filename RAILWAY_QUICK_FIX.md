# Quick Fix for Railway "No start command" Error

## The Problem
Railway detected your `package.json` and is trying to use Railpack (Node.js buildpack) instead of Docker.

## Quick Solution (2 minutes)

### In Railway Dashboard:

1. **Delete the current service** (if you created one)

2. **Create Indexer Service:**
   - Click "New" → "Empty Service"
   - Name: `veyra-indexer`
   - Click the three dots (⋯) → "Settings"
   - Scroll to "Build & Deploy"
   - Set **Dockerfile Path:** `indexer/Dockerfile`
   - Set **Docker Context:** `indexer`
   - Click "Deploy"

3. **Create Web Service:**
   - Click "New" → "Empty Service"  
   - Name: `veyra-web`
   - Click the three dots (⋯) → "Settings"
   - Scroll to "Build & Deploy"
   - Set **Dockerfile Path:** `web/Dockerfile`
   - Set **Docker Context:** `web`
   - Click "Deploy"

4. **Set Environment Variables:**
   - For each service, go to "Variables" tab
   - Add the required environment variables
   - **Important:** After indexer deploys, copy its URL and set it as `NEXT_PUBLIC_INDEXER_URL` in web service

That's it! Railway will now use Docker instead of Railpack.

