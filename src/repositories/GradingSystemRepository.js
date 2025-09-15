const BaseRepository = require('./BaseRepository');
const { GradingSystem } = require('../entities');

class GradingSystemRepository extends BaseRepository {
  constructor() {
    super(GradingSystem);
  }
}

module.exports = GradingSystemRepository;
