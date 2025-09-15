const { SubjectRepository } = require('../repositories');
const { SubjectDTO } = require('../dto/SubjectDTO');

class SubjectUseCase {
  constructor() {
    this.subjectRepository = new SubjectRepository();
  }

  async createSubject(data) {
    const subject = await this.subjectRepository.create(data);
    return new SubjectDTO(subject);
  }

  async getAllSubjects() {
    const subjects = await this.subjectRepository.findAll();
    return subjects.map(s => new SubjectDTO(s));
  }

  async getSubjectById(id) {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) throw new Error('Subject not found');
    return new SubjectDTO(subject);
  }

  async updateSubject(id, data) {
    await this.subjectRepository.update(data, { id });
    return this.getSubjectById(id);
  }

  async deleteSubject(id) {
    return this.subjectRepository.delete({ id });
  }
}

module.exports = SubjectUseCase;
