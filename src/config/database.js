const { Sequelize } = require("sequelize");
const config = require("../config/config.js"); // adjust path if different
const pg = require("pg");

let sequelize;

function getSequelize() {
  if (!sequelize) {
    const env = process.env.NODE_ENV || "development";
    const dbConfig = config[env];

    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: "postgres",
        dialectModule: pg, // explicitly tell Sequelize to use pg
        logging: dbConfig.logging,
        dialectOptions: dbConfig.dialectOptions || {},
      }
    );
  }

  return sequelize;
}

module.exports = { getSequelize };
