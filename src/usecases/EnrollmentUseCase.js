const { EnrollmentRepository } = require('../repositories');
const { EnrollmentDTO } = require('../dto/EnrollmentDTO');

class EnrollmentUseCase {
  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }

  async createEnrollment(data) {
    const enrollment = await this.enrollmentRepository.create(data);
    return new EnrollmentDTO(enrollment);
  }

  async getAllEnrollments() {
    const enrollments = await this.enrollmentRepository.findAll();
    return enrollments.map(e => new EnrollmentDTO(e));
  }

  async getEnrollmentById(id) {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) throw new Error('Enrollment not found');
    return new EnrollmentDTO(enrollment);
  }

  async updateEnrollment(id, data) {
    await this.enrollmentRepository.update(data, { id });
    return this.getEnrollmentById(id);
  }

  async deleteEnrollment(id) {
    return this.enrollmentRepository.delete({ id });
  }
}

module.exports = EnrollmentUseCase;
