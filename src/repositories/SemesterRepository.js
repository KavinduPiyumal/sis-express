const BaseRepository = require('./BaseRepository');
const { Semester } = require('../entities');

class SemesterRepository extends BaseRepository {
  constructor() {
    super(Semester);
  }
}

module.exports = SemesterRepository;
