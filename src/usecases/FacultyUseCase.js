const { FacultyRepository } = require('../repositories');
const { FacultyDTO } = require('../dto/FacultyDTO');

class FacultyUseCase {
  constructor() {
    this.facultyRepository = new FacultyRepository();
  }

  async createFaculty(data) {
    const faculty = await this.facultyRepository.create(data);
    return new FacultyDTO(faculty);
  }

  async getAllFaculties() {
    const faculties = await this.facultyRepository.findAll();
    return faculties.map(f => new FacultyDTO(f));
  }

  async getFacultyById(id) {
    const faculty = await this.facultyRepository.findById(id);
    if (!faculty) throw new Error('Faculty not found');
    return new FacultyDTO(faculty);
  }

  async updateFaculty(id, data) {
    await this.facultyRepository.update(data, { id });
    return this.getFacultyById(id);
  }

  async deleteFaculty(id) {
    return this.facultyRepository.delete({ id });
  }
}

module.exports = FacultyUseCase;
