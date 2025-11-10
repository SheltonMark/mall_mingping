#!/bin/bash

# Quick update script - for code changes only (no database changes)
# Run on server: bash quick-update.sh

set -e

PROJECT_DIR="/root/mall_mingping"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  Quick Code Update & Restart"
echo "=========================================="
echo ""

# Step 1: Update code
echo -e "${YELLOW}[1/5] Pulling latest code...${NC}"
cd ${PROJECT_DIR}
git pull origin feature/external-site
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 2: Build backend
echo -e "${YELLOW}[2/5] Building backend...${NC}"
cd ${PROJECT_DIR}/code/backend-api
pnpm install
pnpm run build
echo -e "${GREEN}✓ Backend built${NC}"
echo ""

# Step 3: Build frontend
echo -e "${YELLOW}[3/5] Building frontend...${NC}"
cd ${PROJECT_DIR}/code/frontend
pnpm install
pnpm run build
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Step 4: Restart services
echo -e "${YELLOW}[4/5] Restarting services...${NC}"
pm2 restart backend-api
pm2 restart frontend
echo -e "${GREEN}✓ Services restarted${NC}"
echo ""

# Step 5: Show status
echo -e "${YELLOW}[5/5] Checking status...${NC}"
pm2 status
echo ""

echo "=========================================="
echo -e "${GREEN}  Update Complete! 🎉${NC}"
echo "=========================================="
echo ""
echo "Frontend: http://8.141.127.26:3000"
echo "Backend API: http://8.141.127.26:3001/api"
echo ""
