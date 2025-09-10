class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async findOne(where, options = {}) {
    return await this.model.findOne({ where, ...options });
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findAndCountAll(options = {}) {
    return await this.model.findAndCountAll(options);
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async update(data, where, options = {}) {
    return await this.model.update(data, { where, ...options });
  }

  async delete(where, options = {}) {
    return await this.model.destroy({ where, ...options });
  }

  async count(where = {}) {
    return await this.model.count({ where });
  }

  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }
}

module.exports = BaseRepository;
