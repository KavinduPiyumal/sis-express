const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const GradingSystem = sequelize.define('GradingSystem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // universityId removed
  gradeLetter: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gradePoint: {
    type: DataTypes.DECIMAL(2,1),
    allowNull: false
  }
}, {
  tableName: 'grading_systems',
  timestamps: true
});

module.exports = GradingSystem;
