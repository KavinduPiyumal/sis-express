const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Transcript = sequelize.define('Transcript', {
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
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  finalCGPA: {
    type: DataTypes.DECIMAL(3,2),
    allowNull: false
  },
  graduationStatus: {
    type: DataTypes.ENUM('Pass', 'Fail', 'With Honors'),
    allowNull: false
  }
}, {
  tableName: 'transcripts',
  timestamps: true
});

module.exports = Transcript;
