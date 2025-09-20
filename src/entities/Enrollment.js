const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');


const Enrollment = sequelize.define('Enrollment', {
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
  status: {
    type: DataTypes.ENUM('active', 'dropped', 'completed', 'failed', 'retake'),
    allowNull: false,
    defaultValue: 'active'
  },
  enrolledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'enrollments',
  timestamps: true
});

module.exports = Enrollment;
