// require('dotenv').config();

// module.exports = {
//   development: {
//     username: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'password',
//     database: process.env.DB_NAME || 'sis_database',
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: false,
//   },
//   test: {
//     username: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'password',
//     database: process.env.DB_NAME + '_test' || 'sis_database_test',
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: false,
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false
//       }
//     }
//   }
// };
require('dotenv').config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,     // postgres
  process.env.DB_USER,     // postgres
  process.env.DB_PASSWORD, // your password
  {
    host: process.env.DB_HOST,   // db.blglfluhejrrhbvirihq.supabase.co
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Supabase requires SSL
      },
    },
  }
);

module.exports = sequelize;
