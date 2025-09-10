const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Link = sequelize.define('Link', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  targetAudience: {
    type: DataTypes.ENUM('all', 'students', 'admins'),
    allowNull: false,
    defaultValue: 'all'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'links',
  timestamps: true,
  indexes: [
    { fields: ['isActive'] },
    { fields: ['targetAudience'] },
    { fields: ['category'] },
    { fields: ['order'] }
  ]
});

module.exports = Link;
