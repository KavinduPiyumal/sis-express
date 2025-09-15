const { SemesterRepository } = require('../repositories');
const { SemesterDTO } = require('../dto/SemesterDTO');

class SemesterUseCase {
  constructor() {
    this.semesterRepository = new SemesterRepository();
  }

  async createSemester(data) {
    const semester = await this.semesterRepository.create(data);
    return new SemesterDTO(semester);
  }

  async getAllSemesters() {
    const semesters = await this.semesterRepository.findAll();
    return semesters.map(s => new SemesterDTO(s));
  }

  async getSemesterById(id) {
    const semester = await this.semesterRepository.findById(id);
    if (!semester) throw new Error('Semester not found');
    return new SemesterDTO(semester);
  }

  async updateSemester(id, data) {
    await this.semesterRepository.update(data, { id });
    return this.getSemesterById(id);
  }

  async deleteSemester(id) {
    return this.semesterRepository.delete({ id });
  }
}

module.exports = SemesterUseCase;
