const BaseRepository = require('./BaseRepository');
const { DegreeRule } = require('../entities');

class DegreeRuleRepository extends BaseRepository {
  constructor() {
    super(DegreeRule);
  }
}

module.exports = DegreeRuleRepository;
