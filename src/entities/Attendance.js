const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classSessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'class_sessions',
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
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
    defaultValue: 'present'
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true
  },
  markedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  markedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  medicalId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'medicals',
      key: 'id'
    }
  }
}, {
  tableName: 'attendances',
  timestamps: true
});

module.exports = Attendance;
