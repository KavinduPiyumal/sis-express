const DegreeRuleUseCase = require('../usecases/DegreeRuleUseCase');

class DegreeRuleController {
  constructor() {
    this.useCase = new DegreeRuleUseCase();
  }

  create = async (req, res, next) => {
    try {
      const rule = await this.useCase.createDegreeRule(req.body);
      res.status(201).json({ success: true, data: rule });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const rules = await this.useCase.getAllDegreeRules();
      res.json({ success: true, data: rules });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const rule = await this.useCase.getDegreeRuleById(req.params.id);
      res.json({ success: true, data: rule });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const rule = await this.useCase.updateDegreeRule(req.params.id, req.body);
      res.json({ success: true, data: rule });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteDegreeRule(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new DegreeRuleController();
