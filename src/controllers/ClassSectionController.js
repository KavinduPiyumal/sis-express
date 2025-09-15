const ClassSectionUseCase = require('../usecases/ClassSectionUseCase');

class ClassSectionController {
  constructor() {
    this.useCase = new ClassSectionUseCase();
  }

  create = async (req, res, next) => {
    try {
      const section = await this.useCase.createClassSection(req.body);
      res.status(201).json({ success: true, data: section });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const sections = await this.useCase.getAllClassSections();
      res.json({ success: true, data: sections });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const section = await this.useCase.getClassSectionById(req.params.id);
      res.json({ success: true, data: section });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const section = await this.useCase.updateClassSection(req.params.id, req.body);
      res.json({ success: true, data: section });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteClassSection(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new ClassSectionController();
