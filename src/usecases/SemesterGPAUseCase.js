const { SemesterGPARepository } = require('../repositories');
const { SemesterGPADTO } = require('../dto/SemesterGPADTO');

class SemesterGPAUseCase {
  constructor() {
    this.semesterGPARepository = new SemesterGPARepository();
  }

  async createSemesterGPA(data) {
    const gpa = await this.semesterGPARepository.create(data);
    return new SemesterGPADTO(gpa);
  }

  async getAllSemesterGPAs() {
    const gpas = await this.semesterGPARepository.findAll();
    return gpas.map(g => new SemesterGPADTO(g));
  }

  async getSemesterGPAById(id) {
    const gpa = await this.semesterGPARepository.findById(id);
    if (!gpa) throw new Error('Semester GPA not found');
    return new SemesterGPADTO(gpa);
  }

  async updateSemesterGPA(id, data) {
    await this.semesterGPARepository.update(data, { id });
    return this.getSemesterGPAById(id);
  }

  async deleteSemesterGPA(id) {
    return this.semesterGPARepository.delete({ id });
  }
}

module.exports = SemesterGPAUseCase;
