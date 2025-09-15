const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const ClassSection = sequelize.define('ClassSection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  lecturerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Lecturer is a user
      key: 'id'
    }
  },
  schedule: {
    type: DataTypes.STRING,
    allowNull: true
  },
  semesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'semesters',
      key: 'id'
    }
  }
}, {
  tableName: 'class_sections',
  timestamps: true
});

module.exports = ClassSection;
