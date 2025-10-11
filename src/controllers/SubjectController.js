const SubjectUseCase = require('../usecases/SubjectUseCase');

class SubjectController {
  constructor() {
    this.useCase = new SubjectUseCase();
  }

  create = async (req, res, next) => {
    try {
      const subject = await this.useCase.createSubject(req.body);
      res.status(201).json({ success: true, data: subject });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        q: req.query.q || req.query.search
      };
      const result = await this.useCase.getAllSubjects(options);
      res.json({ success: true, data: result.data, meta: result.meta });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const subject = await this.useCase.getSubjectById(req.params.id);
      res.json({ success: true, data: subject });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const subject = await this.useCase.updateSubject(req.params.id, req.body);
      res.json({ success: true, data: subject });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteSubject(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new SubjectController();
