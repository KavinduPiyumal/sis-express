const ClassSessionRepository = require('../repositories/ClassSessionRepository');
const ClassSessionDTO = require('../dto/ClassSessionDTO');

class ClassSessionUseCase {
  constructor() {
    this.classSessionRepository = new ClassSessionRepository();
  }

  async createClassSession(data) {
    const session = await this.classSessionRepository.create(data);
    return new ClassSessionDTO(session);
  }

  async getAllClassSessions() {
    const sessions = await this.classSessionRepository.findAll();
    return sessions.map(session => new ClassSessionDTO(session));
  }

  async getClassSessionById(id) {
    const session = await this.classSessionRepository.findById(id);
    if (!session) throw new Error('Class session not found');
    return new ClassSessionDTO(session);
  }

  async updateClassSession(id, data) {
    const session = await this.classSessionRepository.update(id, data);
    if (!session) throw new Error('Class session not found');
    return new ClassSessionDTO(session);
  }

  async deleteClassSession(id) {
    const deleted = await this.classSessionRepository.delete(id);
    if (!deleted) throw new Error('Class session not found');
    return { message: 'Class session deleted successfully' };
  }
}

module.exports = ClassSessionUseCase;
