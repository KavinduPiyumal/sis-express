const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');


const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
      },
      onDelete: 'CASCADE'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  module: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'logs',
  timestamps: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['action'] },
    { fields: ['entity'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = Log;
