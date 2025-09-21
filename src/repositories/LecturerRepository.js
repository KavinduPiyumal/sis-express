const BaseRepository = require('./BaseRepository');
const Lecturer = require('../entities/Lecturer');

class LecturerRepository extends BaseRepository {
  constructor() {
    super(Lecturer);
  }
}

module.exports = LecturerRepository;
