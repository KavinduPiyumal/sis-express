const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  facultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculties',
      key: 'id'
    }
  }
}, {
  tableName: 'departments',
  timestamps: true
});

module.exports = Department;
