const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  targetAudience: {
    type: DataTypes.ENUM('all', 'students', 'admins'),
    allowNull: false,
    defaultValue: 'all'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  publishDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'notices',
  timestamps: true,
  indexes: [
    { fields: ['isActive'] },
    { fields: ['priority'] },
    { fields: ['targetAudience'] },
    { fields: ['publishDate'] }
  ]
});

module.exports = Notice;
