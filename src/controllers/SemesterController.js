const SemesterUseCase = require('../usecases/SemesterUseCase');

class SemesterController {
  constructor() {
    this.useCase = new SemesterUseCase();
  }

  create = async (req, res, next) => {
    try {
      const semester = await this.useCase.createSemester(req.body);
      res.status(201).json({ success: true, data: semester });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const semesters = await this.useCase.getAllSemesters();
      res.json({ success: true, data: semesters });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const semester = await this.useCase.getSemesterById(req.params.id);
      res.json({ success: true, data: semester });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const semester = await this.useCase.updateSemester(req.params.id, req.body);
      res.json({ success: true, data: semester });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteSemester(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new SemesterController();
