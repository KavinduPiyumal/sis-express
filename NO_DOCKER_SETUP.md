# SIS Backend Setup Guide - No Docker Required

This guide shows you how to set up the Student Information System backend without using Docker. You have several options for PostgreSQL.

## 🎯 Overview

You have 3 main options for PostgreSQL without Docker:
1. **Cloud PostgreSQL** (Easiest - No installation)
2. **Local PostgreSQL Installation** 
3. **SQLite for Development** (Quickest for testing)

---

## Option 1: Cloud PostgreSQL (Recommended - No Installation)

### 1.1 Supabase (Free Tier)

**Step 1: Create Supabase Account**
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Google or email
4. Create a new project:
   - Project name: `sis-backend`
   - Database password: Choose a strong password
   - Region: Select closest to you

**Step 2: Get Database Credentials**
1. Go to Settings → Database
2. Copy the connection details
3. Note down:
   - Host
   - Database name
   - Username
   - Password
   - Port (usually 5432)

**Step 3: Setup Project**
```bash
# Navigate to project directory
cd c:\Users\Dev\Desktop\SISJAffna\sis-express

# Copy environment file
copy .env.example .env

# Install dependencies (if not done)
npm install
```

**Step 4: Update .env file**
Open `.env` and update with your Supabase credentials:
```env
# Database Configuration (Supabase)
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-database-password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# File Upload Configuration
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:3001
```

### 1.2 Neon (Alternative Free Option)

**Step 1: Create Neon Account**
1. Go to https://neon.tech
2. Sign up with GitHub/Google
3. Create a new project
4. Choose a region

**Step 2: Get Connection String**
1. Go to your project dashboard
2. Click "Connection Details"
3. Copy the connection parameters

**Step 3: Update .env file**
```env
# Database Configuration (Neon)
DB_HOST=your-host.neon.tech
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
```

### 1.3 ElephantSQL (Smallest Free Tier)

**Step 1: Create ElephantSQL Account**
1. Go to https://www.elephantsql.com
2. Sign up for free account
3. Create new instance:
   - Plan: Tiny Turtle (Free)
   - Name: sis-backend
   - Region: Choose closest

**Step 2: Get Database URL**
1. Click on your instance
2. Copy the database details from the dashboard

**Step 3: Update .env file**
```env
# Database Configuration (ElephantSQL)
DB_HOST=your-host.elephantsql.com
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
```

---

## Option 2: Local PostgreSQL Installation

### 2.1 Windows Installation

**Step 1: Download PostgreSQL**
1. Go to https://www.postgresql.org/download/windows/
2. Download the installer (latest stable version)
3. Run the installer as Administrator

**Step 2: Installation Process**
1. Choose installation directory (default is fine)
2. Select components:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Stack Builder
   - ✅ Command Line Tools
3. Set data directory (default is fine)
4. **Set password for postgres user** (remember this!)
5. Set port: 5432 (default)
6. Choose locale (default)
7. Complete installation

**Step 3: Create Database**
1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect with password you set
3. Right-click "Databases" → Create → Database
4. Database name: `sis_database`
5. Owner: postgres
6. Click Save

**Alternative: Command Line**
```cmd
# Open Command Prompt as Administrator
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL
psql -U postgres

# Enter password when prompted
# Create database
CREATE DATABASE sis_database;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sis_database TO postgres;

# Exit
\q
```

**Step 4: Update .env file**
```env
# Database Configuration (Local Windows)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sis_database
DB_USER=postgres
DB_PASSWORD=your-postgres-password

# Other configurations...
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### 2.2 macOS Installation

**Step 1: Install PostgreSQL**
```bash
# Option 1: Using Homebrew (recommended)
brew install postgresql

# Option 2: Download from https://www.postgresql.org/download/macosx/
```

**Step 2: Start PostgreSQL Service**
```bash
# Start PostgreSQL service
brew services start postgresql

# Or manually
pg_ctl -D /usr/local/var/postgres start
```

**Step 3: Create Database**
```bash
# Create database
createdb sis_database

# Connect and verify
psql sis_database

# Exit
\q
```

**Step 4: Update .env file**
```env
# Database Configuration (Local macOS)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sis_database
DB_USER=your-username
DB_PASSWORD=
```

### 2.3 Linux (Ubuntu/Debian) Installation

**Step 1: Install PostgreSQL**
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Step 2: Setup Database**
```bash
# Switch to postgres user
sudo -i -u postgres

# Create database
createdb sis_database

# Access PostgreSQL shell
psql

# Set password for postgres user
\password postgres

# Exit
\q
exit
```

**Step 3: Update .env file**
```env
# Database Configuration (Local Linux)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sis_database
DB_USER=postgres
DB_PASSWORD=your-postgres-password
```

---

## Option 3: SQLite for Quick Development

If you want to get started immediately without any PostgreSQL setup:

**Step 1: Install SQLite Dependencies**
```bash
npm install sqlite3 --save
```

**Step 2: Update Database Configuration**
Create a new file `src/config/database-sqlite.js`:
```javascript
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database/sis_database.sqlite',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage: './database/sis_database.sqlite',
    logging: false,
  }
};
```

**Step 3: Update Database Connection**
Replace content in `src/infrastructure/database.js`:
```javascript
const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../config/logger');

// Use SQLite for development
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/sis_database.sqlite',
  logging: config.nodeEnv === 'development' ? logger.info.bind(logger) : false,
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('SQLite database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
```

**Step 4: Update .env file**
```env
# SQLite Configuration
DB_DIALECT=sqlite
DB_STORAGE=./database/sis_database.sqlite

# Other configurations remain the same
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

---

## 🚀 Starting the Application

### After Setting Up Database (Any Option Above)

**Step 1: Create Required Directories**
```bash
# Windows
mkdir logs
mkdir uploads

# Linux/Mac
mkdir -p logs uploads
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Start Development Server**
```bash
npm run dev
```

**You should see:**
```
Server running on port 3000 in development mode
Database connection has been established successfully.
Health check available at http://localhost:3000/health
```

**Step 4: Test the Setup**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return:
# {"success":true,"message":"SIS Backend API is running","timestamp":"...","uptime":...}
```

---

## 🧪 Testing All APIs

### Windows Testing
```cmd
# Run the Windows test script
test-apis.bat
```

### Linux/Mac Testing
```bash
# Make script executable
chmod +x test-apis.sh

# Run the test script
./test-apis.sh
```

### Manual Testing
```bash
# 1. Register super admin
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Super\",\"lastName\":\"Admin\",\"email\":\"admin@sis.com\",\"password\":\"admin123\",\"role\":\"super_admin\"}"

# 2. Login
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@sis.com\",\"password\":\"admin123\"}"

# 3. Use the returned token for other API calls
curl -X GET http://localhost:3000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Troubleshooting

### Database Connection Issues

**PostgreSQL not starting:**
```bash
# Windows
net start postgresql-x64-15

# macOS
brew services restart postgresql

# Linux
sudo systemctl restart postgresql
```

**Connection refused:**
1. Check if PostgreSQL is running
2. Verify port 5432 is not blocked
3. Check credentials in .env file

**Permission denied:**
```sql
-- Connect as postgres user and grant permissions
GRANT ALL PRIVILEGES ON DATABASE sis_database TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### Node.js Issues

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

**Module not found:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Database Management Tools

### pgAdmin (PostgreSQL GUI)
- Comes with PostgreSQL installation
- Web interface: http://localhost:5050 (if installed)
- Great for visual database management

### Command Line Tools
```bash
# Connect to database
psql -h localhost -U postgres -d sis_database

# Common commands
\l          # List databases
\dt         # List tables
\d users    # Describe users table
\q          # Quit
```

### Online Database Managers
- **Supabase**: Built-in table editor
- **Neon**: Web-based query editor
- **ElephantSQL**: Browser-based manager

---

## 🔒 Security Considerations

### For Local Development
1. **Change default passwords**
2. **Use strong JWT_SECRET**
3. **Don't commit .env file**

### For Production
1. **Use environment variables**
2. **Enable SSL connections**
3. **Restrict database access**
4. **Use connection pooling**

---

## 📈 Next Steps

1. **Frontend Development**: Create React/Vue frontend
2. **Additional Features**: Medical reports, payments, results
3. **Deployment**: Use PM2, Heroku, or cloud platforms
4. **Monitoring**: Add logging and error tracking

---

## 🎉 Success Checklist

- [ ] Database is running and accessible
- [ ] .env file is configured correctly
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Health check returns success
- [ ] Test script passes all API tests
- [ ] Can register and login users
- [ ] JWT authentication is working

**Once all items are checked, your SIS backend is ready for development!**
