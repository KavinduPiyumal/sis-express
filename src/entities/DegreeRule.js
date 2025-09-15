const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const DegreeRule = sequelize.define('DegreeRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  degreeProgramId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'degree_programs',
      key: 'id'
    }
  },
  minCreditsToGraduate: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  minCGPARequired: {
    type: DataTypes.DECIMAL(3,2),
    allowNull: false
  },
  honorsCriteria: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'degree_rules',
  timestamps: true
});

module.exports = DegreeRule;
