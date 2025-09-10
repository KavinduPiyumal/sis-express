@echo off
echo.
echo ===============================================
echo      SIS Backend Quick Setup (No Docker)
echo ===============================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Install from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Creating directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "database" mkdir database

echo.
echo Setting up environment file...
if not exist ".env" (
    copy .env.example .env
    echo .env file created from template
)

echo.
echo Choose database option:
echo 1. SQLite (Quick start - no setup needed)
echo 2. Cloud PostgreSQL (Production ready)
echo 3. Local PostgreSQL (Manual setup)
echo.
set /p db_choice="Enter choice (1-3): "

if "%db_choice%"=="1" (
    echo.
    echo Installing SQLite...
    npm install sqlite3
    echo DB_DIALECT=sqlite >> .env
    echo DB_STORAGE=./database/sis_database.sqlite >> .env
    echo SQLite configured!
) else if "%db_choice%"=="2" (
    echo.
    echo Cloud PostgreSQL selected.
    echo Please edit .env file with your cloud database credentials.
    echo See NO_DOCKER_SETUP.md for detailed instructions.
    pause
) else if "%db_choice%"=="3" (
    echo.
    echo Local PostgreSQL selected.
    echo Please install PostgreSQL and edit .env file.
    echo See NO_DOCKER_SETUP.md for detailed instructions.
    pause
) else (
    echo Invalid choice! Using SQLite as default...
    npm install sqlite3
    echo DB_DIALECT=sqlite >> .env
    echo DB_STORAGE=./database/sis_database.sqlite >> .env
)

echo.
echo Testing database connection...
node test-database.js
if %errorlevel% neq 0 (
    echo.
    echo Database connection failed!
    echo Please check your .env configuration.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo      Setup Complete!
echo ===============================================
echo.
echo Starting development server...
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
pause
npm run dev
