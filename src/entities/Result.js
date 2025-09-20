const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  courseOfferingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'course_offerings',
      key: 'id'
    }
  },
  marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gradePoint: {
    type: DataTypes.DECIMAL(3,2),
    allowNull: true
  },
  enteredBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  enteredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'results',
  timestamps: true
});

module.exports = Result;
