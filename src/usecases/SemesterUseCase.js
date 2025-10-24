const { SemesterRepository } = require('../repositories');
const { SemesterDTO } = require('../dto/SemesterDTO');
const logger = require('../config/logger');
class SemesterUseCase {
  constructor() {
    this.semesterRepository = new SemesterRepository();
  }

  async createSemester(data) {
    const semester = await this.semesterRepository.create(data);
    return new SemesterDTO(semester);
  }

  async getAllSemesters() {
    const semesters = await this.semesterRepository.findAll();
    return semesters.map(s => new SemesterDTO(s));
  }

  async getSemesterById(id) {
    const semester = await this.semesterRepository.findById(id);
    if (!semester) throw new Error('Semester not found');
    return new SemesterDTO(semester);
  }

  async getSemestersByBatchId(batchId) {
  let semesters = await this.semesterRepository.findAll({ batchId });
  semesters.sort((a, b) => {
    const [yearA, semA] = semesterSortKey(a.name);
    const [yearB, semB] = semesterSortKey(b.name);
    return yearA - yearB || semA - semB;
  });
  return semesters.map(s => new SemesterDTO(s));
}


  async updateSemester(id, data) {
    await this.semesterRepository.update(id, data);
    return this.getSemesterById(id);
  }

  async deleteSemester(id) {
    return this.semesterRepository.delete(id);
  }

    // Start next semester for a batch: set current inprogress to completed, next pending to inprogress
  async startNextSemesterForBatch(batchId) {
    // Find all semesters for the batch, ordered by startDate
    const semesters = await this.semesterRepository.findAll({ batchId });
    logger.info(`Found semesters for batch ${batchId}: ${semesters.map(s => s.id).join(', ')}`);
    if (!semesters || semesters.length === 0) throw new Error('No semesters found for batch');
    // Find current inprogress semester
    const current = semesters.find(s => s.status === 'inprogress');
    // Find next pending semester (after current, or first pending if none inprogress)
    let next = null;
    if (current) {
      next = semesters.find(s => s.status === 'pending' && s.startDate > current.startDate);
    } else {
      next = semesters.find(s => s.status === 'pending');
    }
    if (!next) throw new Error('No next pending semester found');
    // Transaction: set current to completed, next to inprogress
    const prisma = require('../infrastructure/prisma');
    return await prisma.$transaction(async (tx) => {
      if (current) {
        await tx.semester.update({ where: { id: current.id }, data: { status: 'completed' } });
      }
      const updatedNext = await tx.semester.update({ where: { id: next.id }, data: { status: 'inprogress' } });
      return updatedNext;
    });
  }
}

module.exports = SemesterUseCase;
function semesterSortKey(name) {
  // Example: "1st Year Semester 2"
  const match = name.match(/(\d+)[a-z]{2} Year Semester (\d+)/i);
  if (!match) return [Infinity, Infinity];
  return [parseInt(match[1]), parseInt(match[2])];
}

