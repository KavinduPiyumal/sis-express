const { CGPARepository } = require('../repositories');
const { CGPADTO } = require('../dto/CGPADTO');

class CGPAUseCase {
  constructor() {
    this.cgpaRepository = new CGPARepository();
  }

  async createCGPA(data) {
    const cgpa = await this.cgpaRepository.create(data);
    return new CGPADTO(cgpa);
  }

  async getAllCGPAs() {
    const cgpas = await this.cgpaRepository.findAll();
    return cgpas.map(c => new CGPADTO(c));
  }

  async getCGPAById(id) {
    const cgpa = await this.cgpaRepository.findById(id);
    if (!cgpa) throw new Error('CGPA not found');
    return new CGPADTO(cgpa);
  }

  async updateCGPA(id, data) {
    await this.cgpaRepository.update(data, { id });
    return this.getCGPAById(id);
  }

  async deleteCGPA(id) {
    return this.cgpaRepository.delete({ id });
  }
}

module.exports = CGPAUseCase;
