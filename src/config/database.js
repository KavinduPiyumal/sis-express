require("pg"); // 👈 ensures pg is bundled
const { Sequelize } = require("sequelize");
const config = require("../config/config.js");

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
        dialectModule: require("pg"), // redundant but safe
        logging: dbConfig.logging,
        dialectOptions: dbConfig.dialectOptions || {},
      }
    );
  }

  return sequelize;
}

module.exports = { getSequelize };
