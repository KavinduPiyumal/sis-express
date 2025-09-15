const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const DegreeProgram = sequelize.define('DegreeProgram', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  facultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'faculties',
      key: 'id'
    }
  }
}, {
  tableName: 'degree_programs',
  timestamps: true
});

module.exports = DegreeProgram;
