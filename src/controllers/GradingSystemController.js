const GradingSystemUseCase = require('../usecases/GradingSystemUseCase');

class GradingSystemController {
  constructor() {
    this.useCase = new GradingSystemUseCase();
  }

  create = async (req, res, next) => {
    try {
      const grading = await this.useCase.createGradingSystem(req.body);
      res.status(201).json({ success: true, data: grading });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const gradings = await this.useCase.getAllGradingSystems();
      res.json({ success: true, data: gradings });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const grading = await this.useCase.getGradingSystemById(req.params.id);
      res.json({ success: true, data: grading });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const grading = await this.useCase.updateGradingSystem(req.params.id, req.body);
      res.json({ success: true, data: grading });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteGradingSystem(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new GradingSystemController();
