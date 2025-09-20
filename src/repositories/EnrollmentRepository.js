const BaseRepository = require('./BaseRepository');
const { Enrollment } = require('../entities');

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(Enrollment);
  }

  async findByStudentAndOffering(studentId, courseOfferingId) {
    return await this.findOne({ studentId, courseOfferingId });
  }
}

module.exports = EnrollmentRepository;
