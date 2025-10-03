const { DegreeProgramRepository } = require('../repositories');
const { DegreeProgramDTO } = require('../dto/DegreeProgramDTO');

class DegreeProgramUseCase {
  constructor() {
    this.degreeProgramRepository = new DegreeProgramRepository();
  }

  async createDegreeProgram(data) {
    const degree = await this.degreeProgramRepository.create(data);
    return new DegreeProgramDTO(degree);
  }

  async getAllDegreePrograms() {
    const degrees = await this.degreeProgramRepository.findAll();
    return degrees.map(d => new DegreeProgramDTO(d));
  }

  async getDegreeProgramById(id) {
    const degree = await this.degreeProgramRepository.findById(id);
    if (!degree) throw new Error('Degree program not found');
    return new DegreeProgramDTO(degree);
  }

  async updateDegreeProgram(id, data) {
    await this.degreeProgramRepository.update(id, data);
    return this.getDegreeProgramById(id);
  }

  async deleteDegreeProgram(id) {
    return this.degreeProgramRepository.delete(id);
  }
}

module.exports = DegreeProgramUseCase;
