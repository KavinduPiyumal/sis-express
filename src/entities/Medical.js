const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Medical = sequelize.define('Medical', {
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
  submittedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fromDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  toDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
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
  },
  decisionDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'medicals',
  timestamps: true
});

module.exports = Medical;
