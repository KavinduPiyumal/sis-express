const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deanName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactInfo: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  tableName: 'faculties',
  timestamps: true
});

module.exports = Faculty;
