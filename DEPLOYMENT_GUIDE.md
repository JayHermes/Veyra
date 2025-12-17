# Veyra Deployment Guide

This guide will help you deploy the Veyra services using Docker Compose.

## Prerequisites

1. **Docker Desktop** - Make sure Docker Desktop is installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version`

2. **Git** - The repository should already be cloned

## Quick Start

### Option 1: Using PowerShell Script (Recommended)

```powershell
.\deploy.ps1
```

### Option 2: Manual Deployment

1. **Start Docker Desktop** - Ensure Docker Desktop is running

2. **Create Environment File** (Optional)
   - Copy `.env.example` to `.env` if you need custom configuration
   - Most services will work with default values

3. **Build and Start Services**
   ```powershell
   docker-compose build
   docker-compose up -d
   ```

4. **Verify Services**
   ```powershell
   docker-compose ps
   ```

## Services

Once deployed, the following services will be available:

- **Indexer API**: http://localhost:4001
  - Health check: http://localhost:4001/health
  - API endpoints for markets, positions, operators, etc.

- **Web Frontend**: http://localhost:3000
  - Next.js application
  - Connects to indexer automatically

- **AVS Service** (Optional)
  - Only runs with `--profile avs` flag
  - Requires additional configuration in `.env`

## Useful Commands

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f indexer
docker-compose logs -f web
```

### Stop Services
```powershell
docker-compose down
```

### Restart Services
```powershell
docker-compose restart
```

### Rebuild After Code Changes
```powershell
docker-compose build --no-cache
docker-compose up -d
```

### Check Service Status
```powershell
docker-compose ps
```

## Environment Variables

Key environment variables (set in `.env` or `docker-compose.yml`):

### Indexer
- `PORT`: API port (default: 4001)
- `RUN_INDEXER`: Enable event listening (0 or 1, default: 0)
- `SEPOLIA_RPC_URL`: Ethereum Sepolia RPC endpoint
- `FACTORY`: Market factory contract address
- `ORACLE_ADDRESS`: Oracle contract address
- `ADAPTER_ADDRESS`: Adapter contract address

### Web
- `NEXT_PUBLIC_INDEXER_URL`: Indexer API URL
- `NEXT_PUBLIC_SEPOLIA_RPC_URL`: RPC endpoint for frontend
- `NEXT_PUBLIC_FACTORY_ADDRESS`: Factory contract address
- `NEXT_PUBLIC_ORACLE_ADDRESS`: Oracle contract address
- `NEXT_PUBLIC_ADAPTER_ADDRESS`: Adapter contract address

## Troubleshooting

### Docker Desktop Not Running
**Error**: `The system cannot find the file specified`
**Solution**: Start Docker Desktop application

### Build Fails
**Error**: Build errors or timeouts
**Solution**: 
- Check internet connection
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker-compose build --no-cache`

### Port Already in Use
**Error**: `port is already allocated`
**Solution**: 
- Stop other services using ports 3000 or 4001
- Or modify ports in `docker-compose.yml`

### Services Not Starting
**Solution**:
- Check logs: `docker-compose logs`
- Verify Docker is running: `docker ps`
- Check disk space: `docker system df`

## Development Mode

For local development without Docker:

```powershell
# Terminal 1: Indexer
cd indexer
npm install
npm start

# Terminal 2: Web
cd web
pnpm install
pnpm dev
```

## Additional Resources

- See `DOCKER_README.md` for more detailed Docker information
- See `API_STATUS.md` for API endpoint documentation
- Check individual service READMEs in `indexer/`, `web/`, and `avs/` directories



