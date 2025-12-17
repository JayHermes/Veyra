# Veyra Docker Deployment Script
# This script helps deploy the Veyra services using Docker Compose

Write-Host "=== Veyra Docker Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerCheck = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker Desktop is not responding properly!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host $dockerCheck -ForegroundColor Gray
        Write-Host ""
        Write-Host "Please try:" -ForegroundColor Yellow
        Write-Host "  1. Restart Docker Desktop" -ForegroundColor White
        Write-Host "  2. Wait for 'Docker Desktop is running' status" -ForegroundColor White
        Write-Host "  3. Run this script again" -ForegroundColor White
        Write-Host ""
        Write-Host "See TROUBLESHOOTING.md for more help." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found. Creating from defaults..." -ForegroundColor Yellow
    Write-Host "You may need to edit .env with your specific configuration." -ForegroundColor Yellow
    Write-Host ""
}

# Build and start services
Write-Host "Building Docker images..." -ForegroundColor Yellow
Write-Host "This may take several minutes on first build..." -ForegroundColor Gray
docker compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host "See TROUBLESHOOTING.md for help." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

Write-Host "Starting services..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Services are now running:" -ForegroundColor Cyan
Write-Host "  - Indexer API: http://localhost:4001" -ForegroundColor White
Write-Host "  - Web Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To view logs: docker compose logs -f" -ForegroundColor Yellow
Write-Host "To stop services: docker compose down" -ForegroundColor Yellow
Write-Host ""


