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
      const { page, limit } = req.query;
      // If pagination params provided, use paged endpoint
      if (page !== undefined || limit !== undefined) {
        // Normalize pagination params
        const pageNum = page !== undefined ? parseInt(page) : 1;
        const limitNum = limit !== undefined ? parseInt(limit) : 10;

        const result = await this.useCase.getPagedDegreePrograms({ page: pageNum, limit: limitNum });

        // Compute displaying range for UI: "Showing X to Y of Z"
        const totalCount = result.meta && result.meta.totalCount ? result.meta.totalCount : 0;
        const programsCount = Array.isArray(result.programs) ? result.programs.length : 0;
        const showingFrom = programsCount > 0 ? ((pageNum - 1) * limitNum) + 1 : 0;
        const showingTo = programsCount > 0 ? ((pageNum - 1) * limitNum) + programsCount : 0;

        return res.json({
          success: true,
          data: result.programs,
          meta: {
            ...result.meta,
            showingFrom,
            showingTo
          }
        });
      }

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
