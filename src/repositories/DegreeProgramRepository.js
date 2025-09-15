const BaseRepository = require('./BaseRepository');
const { DegreeProgram } = require('../entities');

class DegreeProgramRepository extends BaseRepository {
  constructor() {
    super(DegreeProgram);
  }
}

module.exports = DegreeProgramRepository;
