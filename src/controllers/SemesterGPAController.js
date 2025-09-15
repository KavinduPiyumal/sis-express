const SemesterGPAUseCase = require('../usecases/SemesterGPAUseCase');

class SemesterGPAController {
  constructor() {
    this.useCase = new SemesterGPAUseCase();
  }

  create = async (req, res, next) => {
    try {
      const gpa = await this.useCase.createSemesterGPA(req.body);
      res.status(201).json({ success: true, data: gpa });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const gpas = await this.useCase.getAllSemesterGPAs();
      res.json({ success: true, data: gpas });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const gpa = await this.useCase.getSemesterGPAById(req.params.id);
      res.json({ success: true, data: gpa });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const gpa = await this.useCase.updateSemesterGPA(req.params.id, req.body);
      res.json({ success: true, data: gpa });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteSemesterGPA(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new SemesterGPAController();
