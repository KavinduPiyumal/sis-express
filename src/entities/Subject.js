const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  creditHours: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semesterOffered: {
    type: DataTypes.STRING,
    allowNull: true
  },
  degreeProgramId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'degree_programs',
      key: 'id'
    }
  }
}, {
  tableName: 'subjects',
  timestamps: true
});

module.exports = Subject;
