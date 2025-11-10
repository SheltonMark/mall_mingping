@echo off
echo ==========================================
echo   Production Deployment Instructions
echo ==========================================
echo.
echo Server: 8.141.127.26
echo User: root
echo Password: 25884hsY!
echo.
echo STEP 1: Copy this command and run it to SSH into the server:
echo.
echo   ssh root@8.141.127.26
echo.
echo STEP 2: Once connected, run these commands:
echo.
echo   cd /root/mall_mingping
echo   git pull origin feature/external-site
echo   cd code/backend-api
echo   pnpm install
echo   pnpm run build
echo   cd ../frontend
echo   pnpm install
echo   pnpm run build
echo   cd ../..
echo   pm2 restart backend-api
echo   pm2 restart frontend
echo   pm2 status
echo.
echo ==========================================
echo   Deployment Complete!
echo ==========================================
echo.
echo Access the site at: http://8.141.127.26:3000
echo.
pause
