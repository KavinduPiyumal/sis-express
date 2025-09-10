# PostgreSQL Integration Guide

This guide provides multiple options to integrate PostgreSQL with your SIS project, especially if you don't have PostgreSQL installed locally.

## Option 1: Docker PostgreSQL (Recommended)

### Prerequisites
- Docker installed on your machine
- Docker Compose (usually comes with Docker)

### Step 1: Create Docker Compose file
Create `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: sis-postgres
    restart: always
    environment:
      POSTGRES_DB: sis_database
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: sis-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@sis.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Step 2: Update your .env file
```env
# Database Configuration for Docker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sis_database
DB_USER=postgres
DB_PASSWORD=postgres123

# Other configurations...
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### Step 3: Start PostgreSQL with Docker
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Check if container is running
docker ps

# View logs
docker-compose logs postgres

# Stop containers
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Step 4: Access PostgreSQL
```bash
# Connect to PostgreSQL via Docker
docker exec -it sis-postgres psql -U postgres -d sis_database

# Or use any PostgreSQL client with:
# Host: localhost
# Port: 5432
# Database: sis_database
# Username: postgres
# Password: postgres123
```

### Step 5: Access pgAdmin (Optional)
1. Open browser: http://localhost:5050
2. Login: admin@sis.com / admin123
3. Add server connection:
   - Host: postgres (container name)
   - Port: 5432
   - Username: postgres
   - Password: postgres123

## Option 2: Cloud PostgreSQL Services

### 2.1 Supabase (Free Tier Available)

1. **Sign up at**: https://supabase.com
2. **Create new project**
3. **Get connection details** from Settings > Database
4. **Update .env file**:
```env
DB_HOST=db.your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
```

### 2.2 Neon (Free Tier Available)

1. **Sign up at**: https://neon.tech
2. **Create database**
3. **Get connection string**
4. **Update .env file**:
```env
DB_HOST=your-host.neon.tech
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password
```

### 2.3 ElephantSQL (Free Tier Available)

1. **Sign up at**: https://www.elephantsql.com
2. **Create new instance** (Tiny Turtle - Free)
3. **Get connection details**
4. **Update .env file**:
```env
DB_HOST=your-host.elephantsql.com
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password
```

## Option 3: Local PostgreSQL Installation

### Windows Installation

1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. **Run installer** and follow setup wizard
3. **Set password** for postgres user
4. **Note the port** (default: 5432)
5. **Update .env file**:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sis_database
DB_USER=postgres
DB_PASSWORD=your-password
```

6. **Create database**:
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE sis_database;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sis_database TO postgres;
```

### macOS Installation

```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb sis_database

# Connect
psql sis_database
```

### Linux Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb sis_database

# Set password
sudo -u postgres psql
\password postgres
```

## Option 4: SQLite for Development (Easiest)

If you want to get started quickly without PostgreSQL setup:

### Step 1: Update package.json
```json
{
  "dependencies": {
    "sqlite3": "^5.1.6"
  }
}
```

### Step 2: Update database config
```javascript
// src/config/database.js
module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database/sis_database.sqlite',
    logging: false,
  },
  // ... other environments
};
```

### Step 3: Update .env file
```env
# SQLite doesn't need these, but keep for production
DB_DIALECT=sqlite
DB_STORAGE=./database/sis_database.sqlite
```

## Database Initialization Scripts

Create initialization SQL scripts in `database/init/`:

### Create `database/init/01-create-extensions.sql`:
```sql
-- Create extensions if using PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Create `database/init/02-seed-data.sql`:
```sql
-- Insert sample super admin (password: admin123)
INSERT INTO users (
    id,
    "firstName",
    "lastName",
    email,
    password,
    role,
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'Super',
    'Admin',
    'admin@sis.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgdGrkfQlYUtRk6', -- admin123
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
```

## Testing Database Connection

Create a simple test script `test-db.js`:

```javascript
const { sequelize } = require('./src/infrastructure/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT NOW()');
    console.log('✅ Query test successful:', result[0][0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run the test:
```bash
node test-db.js
```

## Recommended Setup for Development

### Quick Start (Docker - Recommended)

1. **Create docker-compose.yml** (see Option 1)
2. **Start PostgreSQL**:
   ```bash
   docker-compose up -d postgres
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

The application will automatically create tables on first run in development mode.

## Troubleshooting

### Common Issues

1. **Connection refused**:
   - Check if PostgreSQL is running
   - Verify host and port in .env
   - Check firewall settings

2. **Authentication failed**:
   - Verify username and password
   - Check pg_hba.conf for authentication method

3. **Database doesn't exist**:
   - Create the database manually
   - Check database name in .env

4. **Docker issues**:
   ```bash
   # Reset Docker containers
   docker-compose down -v
   docker-compose up -d postgres
   ```

### Useful Commands

```bash
# Check PostgreSQL status (Docker)
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Access PostgreSQL shell
docker exec -it sis-postgres psql -U postgres -d sis_database

# Backup database (Docker)
docker exec sis-postgres pg_dump -U postgres sis_database > backup.sql

# Restore database (Docker)
cat backup.sql | docker exec -i sis-postgres psql -U postgres -d sis_database
```

## Production Considerations

1. **Use strong passwords**
2. **Enable SSL/TLS connections**
3. **Configure proper user permissions**
4. **Set up regular backups**
5. **Monitor database performance**
6. **Use connection pooling**

Choose the option that best fits your development environment and requirements. Docker is recommended for its simplicity and consistency across different operating systems.
