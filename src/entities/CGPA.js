const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const CGPA = sequelize.define('CGPA', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cgpaValue: {
    type: DataTypes.DECIMAL(3,2),
    allowNull: false
  },
  graduationStatus: {
    type: DataTypes.ENUM('Pass', 'Fail', 'With Honors'),
    allowNull: false
  }
}, {
  tableName: 'cgpas',
  timestamps: true
});

module.exports = CGPA;
