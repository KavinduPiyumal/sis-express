const CourseOfferingUseCase = require('../usecases/CourseOfferingUseCase');
const useCase = new CourseOfferingUseCase();

module.exports = {
  async create(req, res) {
    try {
      const offering = await useCase.createCourseOffering(req.body);
      res.status(201).json(offering);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const offerings = await useCase.getAllCourseOfferings();
      res.json(offerings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  /**
   * Get course offerings by dynamic filters (query params: lecturerId, subjectId, batchId, semesterId, etc.)
   */
  async getByFilters(req, res) {
    try {
      // Only allow known filter fields
      const allowedFields = ['lecturerId', 'subjectId', 'batchId', 'semesterId', 'year', 'mode'];
      const filters = {};
      for (const key of allowedFields) {
        if (req.query[key]) filters[key] = req.query[key];
      }

      // Attach related reference records using Sequelize include

      const include = [
        // { association: 'subject' },
        // { association: 'semester' },
        // { association: 'batch' },
        // { association: 'lecturer' }
      ];

      const offerings = await useCase.getCourseOfferingsByFilters(filters, { include });
      res.json(offerings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const offering = await useCase.getCourseOfferingById(req.params.id);
      res.json(offering);
    } catch (err) {
      if (err.message === 'Course offering not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const offering = await useCase.updateCourseOffering(req.params.id, req.body);
      res.json(offering);
    } catch (err) {
      if (err.message === 'Course offering not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await useCase.deleteCourseOffering(req.params.id);
      res.status(204).end();
    } catch (err) {
      if (err.message === 'Course offering not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: err.message });
    }
  }
};
