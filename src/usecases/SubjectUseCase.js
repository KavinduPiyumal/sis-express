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

  async getAllSubjects(options = {}) {
    // options may include: page, limit, q (search)
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const perPageRaw = parseInt(options.limit, 10) || 20;
    const perPage = Math.min(Math.max(1, perPageRaw), 100);
    const q = (options.q || options.search || '').toString().trim();
    const where = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }] } : {};

    const total = await this.subjectRepository.count(where);
    const totalPages = total === 0 ? 1 : Math.ceil(total / perPage);
    const safePage = page > totalPages ? totalPages : page;

    const subjects = await this.subjectRepository.findPaginated({ where, skip: (safePage - 1) * perPage, take: perPage, orderBy: { name: 'asc' } });

    return {
      data: subjects.map(s => new SubjectDTO(s)),
      meta: {
        total,
        totalPages,
        page: safePage,
        perPage
      }
    };
  }

  async getSubjectById(id) {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) throw new Error('Subject not found');
    return new SubjectDTO(subject);
  }

  async updateSubject(id, data) {
    await this.subjectRepository.update(id, data);
    return this.getSubjectById(id);
  }

  async deleteSubject(id) {
    return this.subjectRepository.delete(id);
  }
}

module.exports = SubjectUseCase;
