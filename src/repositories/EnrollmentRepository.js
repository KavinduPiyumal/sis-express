const BaseRepository = require('./BaseRepository');
const { Enrollment } = require('../entities');

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(Enrollment);
  }
}

module.exports = EnrollmentRepository;
