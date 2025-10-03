const CourseOfferingUseCase = require('../usecases/CourseOfferingUseCase');
const useCase = new CourseOfferingUseCase();

module.exports = {
  async create(req, res) {
    try {
      // Handle lecturerId lookup - if lecturerId is not found in lecturer table, treat it as userId
      if (req.body.lecturerId) {
        const resolvedLecturerId = await useCase.resolveLecturerId(req.body.lecturerId);
        if (resolvedLecturerId) {
          req.body.lecturerId = resolvedLecturerId;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid lecturerId or userId provided'
          });
        }
      }

      const offering = await useCase.createCourseOffering(req.body);
      res.status(201).json({
        success: true,
        data: offering
      });
    } catch (err) {
      res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
  },
  async getAll(req, res) {
    try {
      const offerings = await useCase.getAllCourseOfferings();
      res.json({
        success: true,
        data: offerings
      });
    } catch (err) {
      res.status(500).json({ 
        success: false, 
        error: err.message 
      });
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

      // Handle lecturerId lookup - if lecturerId is not found in lecturer table, treat it as userId
      if (filters.lecturerId) {
        const resolvedLecturerId = await useCase.resolveLecturerId(filters.lecturerId);
        if (resolvedLecturerId) {
          filters.lecturerId = resolvedLecturerId;
        }
      }

      const offerings = await useCase.getCourseOfferingsByFilters(filters);
      res.json({
        success: true,
        data: offerings
      });
    } catch (err) {
      res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
  },

  async getAllByLecturer(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID missing in token' 
        });
      }
      const offerings = await useCase.getCourseOfferingsByLecturer(userId);
      res.json({
        success: true,
        data: offerings
      });
    } catch (err) {
      res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
  },

  async getById(req, res) {
    try {
      const offering = await useCase.getCourseOfferingById(req.params.id);
      res.json({
        success: true,
        data: offering
      });
    } catch (err) {
      if (err.message === 'Course offering not found') {
        return res.status(404).json({ 
          success: false, 
          error: 'Not found' 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
  },
  async update(req, res) {
    try {
      // Handle lecturerId lookup - if lecturerId is not found in lecturer table, treat it as userId
      if (req.body.lecturerId) {
        const resolvedLecturerId = await useCase.resolveLecturerId(req.body.lecturerId);
        if (resolvedLecturerId) {
          req.body.lecturerId = resolvedLecturerId;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid lecturerId or userId provided'
          });
        }
      }

      const offering = await useCase.updateCourseOffering(req.params.id, req.body);
      res.json({
        success: true,
        data: offering
      });
    } catch (err) {
      if (err.message === 'Course offering not found') {
        return res.status(404).json({ 
          success: false, 
          error: 'Not found' 
        });
      }
      res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
  },
  async delete(req, res) {
    try {
      const result = await useCase.deleteCourseOffering(req.params.id);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err.message === 'Course offering not found') {
        return res.status(404).json({ 
          success: false, 
          error: 'Not found' 
        });
      }
      res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
  }
};
