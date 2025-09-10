#!/bin/bash

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}      SIS Backend Setup - No Docker Required${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

echo -e "${BLUE}This script will help you set up the SIS backend without Docker.${NC}"
echo ""

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js is installed${NC}"
    node --version
fi
echo ""

# Check if npm is available
echo -e "${BLUE}Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not available!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm is available${NC}"
    npm --version
fi
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found!${NC}"
    echo -e "${YELLOW}Please run this script from the SIS project directory${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Found package.json${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing Node.js dependencies...${NC}"
if ! npm install; then
    echo -e "${RED}❌ Failed to install dependencies!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
echo ""

# Create required directories
echo -e "${BLUE}Creating required directories...${NC}"
mkdir -p logs uploads database
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Please edit the .env file with your database credentials!${NC}"
    echo ""
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Database setup options
echo -e "${BLUE}=== Database Setup Options ===${NC}"
echo ""
echo "1. Cloud PostgreSQL (Recommended - No installation required)"
echo "2. Local PostgreSQL (Requires installation)"
echo "3. SQLite (Quick testing - No PostgreSQL needed)"
echo ""
read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}=== Cloud PostgreSQL Setup ===${NC}"
        echo ""
        echo "Choose a cloud provider:"
        echo "1. Supabase (500MB free)"
        echo "2. Neon (3GB free)"
        echo "3. ElephantSQL (20MB free)"
        echo ""
        echo -e "${YELLOW}Manual steps required:${NC}"
        echo "1. Create an account at your chosen provider"
        echo "2. Create a new database"
        echo "3. Copy the connection details"
        echo "4. Update the .env file with your credentials"
        echo ""
        echo -e "${BLUE}Example .env configuration:${NC}"
        echo "DB_HOST=your-host.provider.com"
        echo "DB_PORT=5432"
        echo "DB_NAME=your-database-name"
        echo "DB_USER=your-username"
        echo "DB_PASSWORD=your-password"
        echo ""
        echo -e "${YELLOW}See NO_DOCKER_SETUP.md for detailed instructions${NC}"
        ;;
    2)
        echo ""
        echo -e "${BLUE}=== Local PostgreSQL Setup ===${NC}"
        echo ""
        
        # Check OS and provide installation instructions
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo -e "${YELLOW}Ubuntu/Debian installation:${NC}"
            echo "sudo apt update"
            echo "sudo apt install postgresql postgresql-contrib"
            echo "sudo -u postgres createdb sis_database"
            echo ""
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            echo -e "${YELLOW}macOS installation:${NC}"
            echo "# Using Homebrew:"
            echo "brew install postgresql"
            echo "brew services start postgresql"
            echo "createdb sis_database"
            echo ""
        fi
        
        echo -e "${BLUE}After installation, update .env file:${NC}"
        echo "DB_HOST=localhost"
        echo "DB_PORT=5432"
        echo "DB_NAME=sis_database"
        echo "DB_USER=postgres"
        echo "DB_PASSWORD=your-postgres-password"
        echo ""
        echo -e "${YELLOW}See NO_DOCKER_SETUP.md for detailed instructions${NC}"
        ;;
    3)
        echo ""
        echo -e "${BLUE}=== SQLite Setup (Development Only) ===${NC}"
        echo ""
        echo -e "${BLUE}Installing SQLite dependency...${NC}"
        if ! npm install sqlite3; then
            echo -e "${RED}❌ Failed to install SQLite!${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ SQLite installed${NC}"
        echo ""
        echo -e "${BLUE}Updating database configuration for SQLite...${NC}"
        echo "DB_DIALECT=sqlite" >> .env
        echo "DB_STORAGE=./database/sis_database.sqlite" >> .env
        echo -e "${GREEN}✅ SQLite configuration added to .env${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}=== Testing Database Connection ===${NC}"
echo ""
echo -e "${YELLOW}Testing database connection...${NC}"
if ! node test-database.js; then
    echo -e "${RED}❌ Database connection test failed!${NC}"
    echo -e "${YELLOW}Please check your database configuration in .env file${NC}"
    echo -e "${YELLOW}See NO_DOCKER_SETUP.md for troubleshooting${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}=== Starting Development Server ===${NC}"
echo ""
echo -e "${YELLOW}Starting the SIS backend server...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo -e "${GREEN}Server will be available at: http://localhost:3000${NC}"
echo -e "${GREEN}Health check: http://localhost:3000/health${NC}"
echo ""
read -p "Press Enter to start the server..."
npm run dev
