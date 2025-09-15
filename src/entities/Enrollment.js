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
      model: 'users',
      key: 'id'
    }
  },
  classSectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'class_sections',
      key: 'id'
    }
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'enrollments',
  timestamps: true
});

module.exports = Enrollment;
