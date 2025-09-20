const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const ClassSession = sequelize.define('ClassSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseOfferingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'course_offerings',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'class_sessions',
  timestamps: true
});

module.exports = ClassSession;
