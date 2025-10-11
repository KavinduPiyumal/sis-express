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
    // Backwards compatible: if no args provided, return full list
    const degrees = await this.degreeProgramRepository.findAll();
    return degrees.map(d => new DegreeProgramDTO(d));
  }

  async getPagedDegreePrograms(options = {}) {
    const page = options.page !== undefined ? parseInt(options.page) : 1;
    const limit = options.limit !== undefined ? parseInt(options.limit) : 10;
    const skip = (page - 1) * limit;

  // Order by `name` by default (model doesn't have createdAt)
  const repoResult = await this.degreeProgramRepository.findAllWithOptions({}, { take: limit, skip, orderBy: { name: 'asc' } });

    if (Array.isArray(repoResult)) {
      return {
        programs: repoResult.map(d => new DegreeProgramDTO(d)),
        meta: {
          totalCount: repoResult.length,
          totalPages: 1,
          currentPage: 1
        }
      };
    }

    const { rows, count } = repoResult;
    return {
      programs: rows.map(d => new DegreeProgramDTO(d)),
      meta: {
        totalCount: count,
        totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
        currentPage: page
      }
    };
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
