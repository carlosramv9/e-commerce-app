@echo off
echo ========================================
echo E-Commerce Setup Script
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not running.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo.
    echo Or setup PostgreSQL manually - see SETUP_DATABASE.md
    pause
    exit /b 1
)

echo Docker found!
echo.

echo [2/5] Starting PostgreSQL with Docker...
docker-compose up -d

echo.
echo Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul

echo.
echo [3/5] Installing backend dependencies...
cd ecommerce-server
call pnpm install

echo.
echo [4/5] Running database migration...
call npx prisma migrate dev --name init

echo.
echo [5/5] Seeding database with sample data...
call npx prisma db seed

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start the backend:
echo    cd ecommerce-server
echo    pnpm run start:dev
echo.
echo 2. Start the frontend (in another terminal):
echo    cd ecommerce-web
echo    pnpm run dev
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001/api
echo    API Docs: http://localhost:3001/api/docs
echo.
echo Default login credentials:
echo    Email: admin@ecommerce.com
echo    Password: admin123
echo.
pause
