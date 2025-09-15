const MedicalReportUseCase = require('../usecases/MedicalReportUseCase');

class MedicalReportController {
  constructor() {
    this.useCase = new MedicalReportUseCase();
  }

  submit = async (req, res, next) => {
    try {
      const report = await this.useCase.submitMedicalReport(req.body, req.user.id);
      res.status(201).json({ success: true, data: report });
    } catch (err) { next(err); }
  };

  review = async (req, res, next) => {
    try {
      const { status, reviewNotes } = req.body;
      const report = await this.useCase.reviewMedicalReport(
        req.params.id,
        req.user.id,
        req.user.role,
        status,
        reviewNotes
      );
      res.json({ success: true, data: report });
    } catch (err) { next(err); }
  };

  getByStudent = async (req, res, next) => {
    try {
      const reports = await this.useCase.getMedicalReportsByStudent(req.params.studentId);
      res.json({ success: true, data: reports });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const reports = await this.useCase.getAllMedicalReports();
      res.json({ success: true, data: reports });
    } catch (err) { next(err); }
  };
}

module.exports = new MedicalReportController();
