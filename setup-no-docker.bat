@echo off
setlocal enabledelayedexpansion

echo.
echo ===============================================
echo      SIS Backend Setup - No Docker Required
echo ===============================================
echo.

REM Colors for Windows (limited)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%This script will help you set up the SIS backend without Docker.%RESET%
echo.

REM Check if Node.js is installed
echo %BLUE%Checking Node.js installation...%RESET%
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%❌ Node.js is not installed!%RESET%
    echo %YELLOW%Please install Node.js from https://nodejs.org%RESET%
    pause
    exit /b 1
) else (
    echo %GREEN%✅ Node.js is installed%RESET%
    node --version
)
echo.

REM Check if npm is available
echo %BLUE%Checking npm installation...%RESET%
npm --version 2>nul
if !errorlevel! neq 0 (
    echo %RED%❌ npm is not available!%RESET%
    pause
    exit /b 1
) else (
    echo %GREEN%✅ npm is available%RESET%
)
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo %RED%❌ package.json not found!%RESET%
    echo %YELLOW%Please run this script from the SIS project directory%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Found package.json%RESET%
echo.

REM Install dependencies
echo %BLUE%Installing Node.js dependencies...%RESET%
npm install
if !errorlevel! neq 0 (
    echo %RED%❌ Failed to install dependencies!%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Dependencies installed successfully%RESET%
echo.

REM Create required directories
echo %BLUE%Creating required directories...%RESET%
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "database" mkdir database
echo %GREEN%✅ Directories created%RESET%
echo.

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo %BLUE%Creating .env file from template...%RESET%
    copy .env.example .env
    echo %GREEN%✅ .env file created%RESET%
    echo.
    echo %YELLOW%⚠️  IMPORTANT: Please edit the .env file with your database credentials!%RESET%
    echo.
) else (
    echo %GREEN%✅ .env file already exists%RESET%
)

REM Database setup options
echo %BLUE%=== Database Setup Options ===%RESET%
echo.
echo 1. Cloud PostgreSQL ^(Recommended - No installation required^)
echo 2. Local PostgreSQL ^(Requires installation^)
echo 3. SQLite ^(Quick testing - No PostgreSQL needed^)
echo.
set /p choice="Choose an option (1-3): "

if "%choice%"=="1" goto cloud_setup
if "%choice%"=="2" goto local_setup
if "%choice%"=="3" goto sqlite_setup
echo %RED%Invalid choice!%RESET%
goto end

:cloud_setup
echo.
echo %BLUE%=== Cloud PostgreSQL Setup ===%RESET%
echo.
echo Choose a cloud provider:
echo 1. Supabase ^(500MB free^)
echo 2. Neon ^(3GB free^)
echo 3. ElephantSQL ^(20MB free^)
echo.
echo %YELLOW%Manual steps required:%RESET%
echo 1. Create an account at your chosen provider
echo 2. Create a new database
echo 3. Copy the connection details
echo 4. Update the .env file with your credentials
echo.
echo %BLUE%Example .env configuration:%RESET%
echo DB_HOST=your-host.provider.com
echo DB_PORT=5432
echo DB_NAME=your-database-name
echo DB_USER=your-username
echo DB_PASSWORD=your-password
echo.
echo %YELLOW%See NO_DOCKER_SETUP.md for detailed instructions%RESET%
goto test_setup

:local_setup
echo.
echo %BLUE%=== Local PostgreSQL Setup ===%RESET%
echo.
echo %YELLOW%You need to install PostgreSQL manually:%RESET%
echo 1. Download from: https://www.postgresql.org/download/windows/
echo 2. Run the installer as Administrator
echo 3. Remember the postgres user password
echo 4. Create database: sis_database
echo.
echo %BLUE%After installation, update .env file:%RESET%
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=sis_database
echo DB_USER=postgres
echo DB_PASSWORD=your-postgres-password
echo.
echo %YELLOW%See NO_DOCKER_SETUP.md for detailed instructions%RESET%
goto test_setup

:sqlite_setup
echo.
echo %BLUE%=== SQLite Setup ^(Development Only^) ===%RESET%
echo.
echo %BLUE%Installing SQLite dependency...%RESET%
npm install sqlite3
if !errorlevel! neq 0 (
    echo %RED%❌ Failed to install SQLite!%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ SQLite installed%RESET%
echo.
echo %BLUE%Updating database configuration for SQLite...%RESET%
REM Update .env for SQLite
echo DB_DIALECT=sqlite >> .env
echo DB_STORAGE=./database/sis_database.sqlite >> .env
echo %GREEN%✅ SQLite configuration added to .env%RESET%
goto test_setup

:test_setup
echo.
echo %BLUE%=== Testing Database Connection ===%RESET%
echo.
echo %YELLOW%Testing database connection...%RESET%
node test-database.js
if !errorlevel! neq 0 (
    echo %RED%❌ Database connection test failed!%RESET%
    echo %YELLOW%Please check your database configuration in .env file%RESET%
    echo %YELLOW%See NO_DOCKER_SETUP.md for troubleshooting%RESET%
    pause
    exit /b 1
)
echo.

echo %BLUE%=== Starting Development Server ===%RESET%
echo.
echo %YELLOW%Starting the SIS backend server...%RESET%
echo %YELLOW%Press Ctrl+C to stop the server%RESET%
echo.
echo %GREEN%Server will be available at: http://localhost:3000%RESET%
echo %GREEN%Health check: http://localhost:3000/health%RESET%
echo.
pause
npm run dev

:end
echo.
echo %BLUE%Setup process completed!%RESET%
echo.
echo %YELLOW%Next steps:%RESET%
echo 1. Configure your database in .env file
echo 2. Run: npm run dev
echo 3. Test APIs: test-apis.bat
echo 4. Open: http://localhost:3000/health
echo.
echo %BLUE%Documentation:%RESET%
echo - NO_DOCKER_SETUP.md - Complete setup guide
echo - API_TESTING_GUIDE.md - API testing instructions
echo - QUICK_START.md - Quick start guide
echo.
pause
