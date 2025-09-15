const FacultyUseCase = require('../usecases/FacultyUseCase');

class FacultyController {
  constructor() {
    this.useCase = new FacultyUseCase();
  }

  create = async (req, res, next) => {
    try {
      const faculty = await this.useCase.createFaculty(req.body);
      res.status(201).json({ success: true, data: faculty });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const faculties = await this.useCase.getAllFaculties();
      res.json({ success: true, data: faculties });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const faculty = await this.useCase.getFacultyById(req.params.id);
      res.json({ success: true, data: faculty });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const faculty = await this.useCase.updateFaculty(req.params.id, req.body);
      res.json({ success: true, data: faculty });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteFaculty(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new FacultyController();
