const BaseRepository = require('./BaseRepository');
const { Faculty } = require('../entities');

class FacultyRepository extends BaseRepository {
  constructor() {
    super(Faculty);
  }
}

module.exports = FacultyRepository;
