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
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  examType: {
    type: DataTypes.ENUM('assignment', 'quiz', 'midterm', 'final', 'project'),
    allowNull: false
  },
  marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: true
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'results',
  timestamps: true,
  indexes: [
    { fields: ['studentId'] },
    { fields: ['subject'] },
    { fields: ['examType'] },
    { fields: ['examDate'] },
    { fields: ['semester'] }
  ]
});

module.exports = Result;
