const { ClassSectionRepository } = require('../repositories');
const { ClassSectionDTO } = require('../dto/ClassSectionDTO');

class ClassSectionUseCase {
  constructor() {
    this.classSectionRepository = new ClassSectionRepository();
  }

  async createClassSection(data) {
    const section = await this.classSectionRepository.create(data);
    return new ClassSectionDTO(section);
  }

  async getAllClassSections() {
    const sections = await this.classSectionRepository.findAll();
    return sections.map(s => new ClassSectionDTO(s));
  }

  async getClassSectionById(id) {
    const section = await this.classSectionRepository.findById(id);
    if (!section) throw new Error('Class section not found');
    return new ClassSectionDTO(section);
  }

  async updateClassSection(id, data) {
    await this.classSectionRepository.update(data, { id });
    return this.getClassSectionById(id);
  }

  async deleteClassSection(id) {
    return this.classSectionRepository.delete({ id });
  }
}

module.exports = ClassSectionUseCase;
