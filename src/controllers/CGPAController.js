const CGPAUseCase = require('../usecases/CGPAUseCase');

class CGPAController {
  constructor() {
    this.useCase = new CGPAUseCase();
  }

  create = async (req, res, next) => {
    try {
      const cgpa = await this.useCase.createCGPA(req.body);
      res.status(201).json({ success: true, data: cgpa });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const cgpas = await this.useCase.getAllCGPAs();
      res.json({ success: true, data: cgpas });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const cgpa = await this.useCase.getCGPAById(req.params.id);
      res.json({ success: true, data: cgpa });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const cgpa = await this.useCase.updateCGPA(req.params.id, req.body);
      res.json({ success: true, data: cgpa });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteCGPA(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new CGPAController();
