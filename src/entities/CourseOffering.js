const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const CourseOffering = sequelize.define('CourseOffering', {
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
  semesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'semesters',
      key: 'id'
    }
  },
  batchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'batches',
      key: 'id'
    }
  },
  lecturerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'course_offerings',
  timestamps: true
});

module.exports = CourseOffering;
