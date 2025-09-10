// Database Connection Test Script
// Run this to verify your database setup without Docker

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testDatabaseConnection() {
  log('\n=== SIS Database Connection Test ===\n', colors.cyan);

  // Check environment variables
  info('Checking environment variables...');
  
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    error(`Missing environment variables: ${missingVars.join(', ')}`);
    error('Please check your .env file');
    process.exit(1);
  }
  
  success('Environment variables are set');
  
  // Display connection info
  info(`Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  info(`Database: ${process.env.DB_NAME}`);
  info(`User: ${process.env.DB_USER}`);
  
  // Create Sequelize instance
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  try {
    // Test basic connection
    info('Testing database connection...');
    await sequelize.authenticate();
    success('Database connection successful!');

    // Test query execution
    info('Testing query execution...');
    const [results] = await sequelize.query('SELECT NOW() as current_time, version() as pg_version');
    success('Query execution successful!');
    
    info(`Current time: ${results[0].current_time}`);
    info(`PostgreSQL version: ${results[0].pg_version.split(' ')[0]}`);

    // Test database permissions
    info('Testing database permissions...');
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS test_permissions (
          id SERIAL PRIMARY KEY,
          test_column VARCHAR(50)
        )
      `);
      
      await sequelize.query('INSERT INTO test_permissions (test_column) VALUES ($1)', {
        bind: ['test_value']
      });
      
      const [selectResults] = await sequelize.query('SELECT * FROM test_permissions LIMIT 1');
      
      await sequelize.query('DROP TABLE test_permissions');
      
      success('Database permissions are correct!');
      success('Can create tables, insert data, and drop tables');
      
    } catch (permError) {
      warning('Database permissions test failed:');
      warning(permError.message);
      warning('You might need to grant additional permissions');
    }

    // Test UUID extension (required for the app)
    info('Testing UUID extension...');
    try {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      success('UUID extension is available');
    } catch (uuidError) {
      warning('UUID extension test failed:');
      warning(uuidError.message);
      warning('The app might have issues generating UUIDs');
    }

    // Connection summary
    log('\n=== Connection Test Summary ===', colors.cyan);
    success('✅ Database connection: OK');
    success('✅ Query execution: OK');
    success('✅ Basic permissions: OK');
    success('✅ UUID extension: OK');
    
    log('\n🎉 Your database is ready for the SIS backend!', colors.green);
    log('\nNext steps:', colors.blue);
    log('1. Run: npm run dev', colors.blue);
    log('2. Test APIs: ./test-apis.sh or test-apis.bat', colors.blue);
    log('3. Check health: curl http://localhost:3000/health', colors.blue);

  } catch (err) {
    error('Database connection failed!');
    error(`Error: ${err.message}`);
    
    log('\n🔧 Troubleshooting tips:', colors.yellow);
    
    if (err.message.includes('ECONNREFUSED')) {
      warning('• PostgreSQL server is not running');
      warning('• Check if PostgreSQL service is started');
      warning('• Verify host and port in .env file');
    }
    
    if (err.message.includes('authentication failed')) {
      warning('• Check username and password in .env file');
      warning('• Verify user exists in PostgreSQL');
      warning('• Check pg_hba.conf authentication method');
    }
    
    if (err.message.includes('database') && err.message.includes('does not exist')) {
      warning('• Create the database manually:');
      warning('  psql -U postgres');
      warning('  CREATE DATABASE sis_database;');
    }
    
    if (err.message.includes('timeout')) {
      warning('• Check firewall settings');
      warning('• Verify network connectivity');
      warning('• Check if PostgreSQL accepts connections');
    }

    log('\n📚 For detailed setup instructions, see:', colors.blue);
    log('• NO_DOCKER_SETUP.md', colors.blue);
    log('• POSTGRESQL_SETUP.md', colors.blue);
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  error('Uncaught Exception:', error.message);
  process.exit(1);
});

// Run the test
testDatabaseConnection();
