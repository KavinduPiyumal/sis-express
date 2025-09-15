const { GradingSystemRepository } = require('../repositories');
const { GradingSystemDTO } = require('../dto/GradingSystemDTO');

class GradingSystemUseCase {
  constructor() {
    this.gradingSystemRepository = new GradingSystemRepository();
  }

  async createGradingSystem(data) {
    const grading = await this.gradingSystemRepository.create(data);
    return new GradingSystemDTO(grading);
  }

  async getAllGradingSystems() {
    const gradings = await this.gradingSystemRepository.findAll();
    return gradings.map(g => new GradingSystemDTO(g));
  }

  async getGradingSystemById(id) {
    const grading = await this.gradingSystemRepository.findById(id);
    if (!grading) throw new Error('Grading system not found');
    return new GradingSystemDTO(grading);
  }

  async updateGradingSystem(id, data) {
    await this.gradingSystemRepository.update(data, { id });
    return this.getGradingSystemById(id);
  }

  async deleteGradingSystem(id) {
    return this.gradingSystemRepository.delete({ id });
  }
}

module.exports = GradingSystemUseCase;
