const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  studentNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  batchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'batches',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  }
  ,
  parentName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'students',
  timestamps: true
});

module.exports = Student;
