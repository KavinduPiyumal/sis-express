const { CourseOffering } = require('../entities');

class CourseOfferingRepository {

    constructor() {
    this.model = CourseOffering;
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
    const offering = await this.model.findByPk(id);
    if (!offering) return null;
    return await offering.update(data, options);
  }

  async delete(id, options = {}) {
    const offering = await this.model.findByPk(id);
    if (!offering) return null;
    await offering.destroy(options);
    return true;
  }

  
  /**
   * Find course offerings by dynamic filters (e.g., lecturerId, subjectId, batchId, semesterId)
   * @param {Object} filters - key-value pairs for filtering
   * @param {Object} options - additional Sequelize options
   */
  async findByFilters(filters = {}, options = {}) {
    return await this.model.findAll({
      where: { ...filters },
      ...options
    });
  }
}

module.exports = CourseOfferingRepository;
