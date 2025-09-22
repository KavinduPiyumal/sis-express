const { ClassSession } = require('../entities');

class ClassSessionRepository {
  constructor() {
    this.model = ClassSession;
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findById(id) {
    return await this.model.findByPk(id);
  }

  async update(id, data, options = {}) {
    const session = await this.model.findByPk(id);
    if (!session) return null;
    return await session.update(data, options);
  }

  async delete(id, options = {}) {
    const session = await this.model.findByPk(id);
    if (!session) return null;
    await session.destroy(options);
    return true;
  }
}

module.exports = ClassSessionRepository;
