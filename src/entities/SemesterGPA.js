const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const SemesterGPA = sequelize.define('SemesterGPA', {
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
  semesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'semesters',
      key: 'id'
    }
  },
  gpaValue: {
    type: DataTypes.DECIMAL(3,2),
    allowNull: false
  }
}, {
  tableName: 'semester_gpas',
  timestamps: true
});

module.exports = SemesterGPA;
