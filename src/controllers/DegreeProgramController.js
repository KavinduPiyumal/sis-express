const DegreeProgramUseCase = require('../usecases/DegreeProgramUseCase');

class DegreeProgramController {
  constructor() {
    this.useCase = new DegreeProgramUseCase();
  }

  create = async (req, res, next) => {
    try {
      const degree = await this.useCase.createDegreeProgram(req.body);
      res.status(201).json({ success: true, data: degree });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const degrees = await this.useCase.getAllDegreePrograms();
      res.json({ success: true, data: degrees });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const degree = await this.useCase.getDegreeProgramById(req.params.id);
      res.json({ success: true, data: degree });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const degree = await this.useCase.updateDegreeProgram(req.params.id, req.body);
      res.json({ success: true, data: degree });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteDegreeProgram(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new DegreeProgramController();
