const { DataTypes } = require('sequelize');
const { sequelize } = require('../infrastructure/database');

const Batch = sequelize.define('Batch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  programId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'degree_programs',
      key: 'id'
    }
  },
  startYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'batches',
  timestamps: true
});

module.exports = Batch;
