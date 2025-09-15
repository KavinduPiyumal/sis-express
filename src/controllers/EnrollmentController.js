
const EnrollmentUseCase = require('../usecases/EnrollmentUseCase');

class EnrollmentController {
  constructor() {
    this.useCase = new EnrollmentUseCase();
  }

  requestEnrollment = async (req, res, next) => {
    try {
      const enrollment = await this.useCase.requestEnrollment(req.body, req.user.id);
      res.status(201).json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  };

  approveEnrollment = async (req, res, next) => {
    try {
      const enrollment = await this.useCase.approveEnrollment(req.params.id, req.user.id);
      res.json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const enrollment = await this.useCase.createEnrollment(req.body);
      res.status(201).json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const enrollments = await this.useCase.getAllEnrollments();
      res.json({ success: true, data: enrollments });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const enrollment = await this.useCase.getEnrollmentById(req.params.id);
      res.json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const enrollment = await this.useCase.updateEnrollment(req.params.id, req.body);
      res.json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteEnrollment(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new EnrollmentController();
