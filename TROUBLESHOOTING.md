# Docker Deployment Troubleshooting

## Current Issue: Docker Engine Connection Error

If you're seeing errors like:
```
request returned 500 Internal Server Error for API route and version
```

This means Docker Desktop's engine is not responding properly.

## Solutions

### Solution 1: Restart Docker Desktop (Recommended)

1. **Close Docker Desktop completely**
   - Right-click the Docker icon in the system tray
   - Click "Quit Docker Desktop"
   - Wait for it to fully close

2. **Restart Docker Desktop**
   - Open Docker Desktop from Start Menu
   - Wait until you see "Docker Desktop is running" in the status

3. **Verify Docker is working**
   ```powershell
   docker ps
   ```
   Should return an empty list (or running containers), not an error.

4. **Try deployment again**
   ```powershell
   docker compose build
   docker compose up -d
   ```

### Solution 2: Reset Docker Desktop

If restarting doesn't work:

1. Open Docker Desktop
2. Go to Settings (gear icon)
3. Go to "Troubleshoot"
4. Click "Reset to factory defaults" (or "Clean / Purge data")
5. Restart Docker Desktop

### Solution 3: Check Docker Desktop Status

1. Open Docker Desktop application
2. Check the status in the bottom left corner
3. If it shows "Docker Desktop is starting...", wait for it to complete
4. If it shows an error, click on it to see details

### Solution 4: Check Windows WSL2 (if using WSL2 backend)

If Docker Desktop uses WSL2:

```powershell
wsl --list --verbose
```

Make sure WSL2 is running and updated.

### Solution 5: Use Docker Compose Plugin

Try using the newer `docker compose` (with space) instead of `docker-compose`:

```powershell
# Instead of: docker-compose build
docker compose build

# Instead of: docker-compose up -d
docker compose up -d
```

## Verification Steps

After fixing the issue, verify Docker is working:

```powershell
# Test 1: Check Docker version
docker --version

# Test 2: Check Docker Compose
docker compose version

# Test 3: List containers (should work without errors)
docker ps

# Test 4: Test Docker engine
docker info
```

All commands should complete without errors.

## Alternative: Manual Build (If Docker Issues Persist)

If Docker continues to have issues, you can run the services manually:

### Indexer
```powershell
cd indexer
npm install
npm run build
npm start
```

### Web
```powershell
cd web
pnpm install
pnpm build
pnpm start
```

See `DOCKER_README.md` for more details on manual setup.


