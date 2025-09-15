const BaseRepository = require('./BaseRepository');
const { SemesterGPA } = require('../entities');

class SemesterGPARepository extends BaseRepository {
  constructor() {
    super(SemesterGPA);
  }
}

module.exports = SemesterGPARepository;
