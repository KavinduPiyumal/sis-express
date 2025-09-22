const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
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
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('completed', 'inprogress', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['completed', 'inprogress', 'pending']]
    }
  }
}, {
  tableName: 'semesters',
  timestamps: true
});

module.exports = Semester;
