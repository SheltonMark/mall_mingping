@echo off
echo ========================================
echo LEMOPX Backend Quick Start
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version || (echo Node.js not found! && exit /b 1)

echo.
echo [2/5] Installing dependencies...
cd code\backend-api
call yarn install || call pnpm install || call npm install

echo.
echo [3/5] Generating Prisma Client...
call npx prisma generate

echo.
echo [4/5] Creating database (make sure MySQL is running)...
echo Please create database manually:
echo   mysql -u root -p
echo   CREATE DATABASE lemopx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
pause

echo.
echo [5/5] Pushing database schema...
call npx prisma db push

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the server:
echo   cd code\backend-api
echo   npm run start:dev
echo.
echo Server will run at: http://localhost:3001/api
echo Prisma Studio: npx prisma studio
echo.
pause
