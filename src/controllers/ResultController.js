const ResultUseCase = require('../usecases/ResultUseCase');
const useCase = new ResultUseCase();

module.exports = {
  /**
   * Create a new result
   */
  async create(req, res) {
    try {
      // Set enteredBy to current user
      req.body.enteredBy = req.user.id;

      const result = await useCase.createResult(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get all results with optional filtering
   */
  async getAll(req, res) {
    try {
      // Build filters from query parameters
      const allowedFields = ['studentId', 'courseOfferingId', 'enteredBy'];
      const filters = {};
      for (const key of allowedFields) {
        if (req.query[key]) filters[key] = req.query[key];
      }

      const results = await useCase.getAllResults(filters);
      res.json({
        success: true,
        data: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get result by ID
   */
  async getById(req, res) {
    try {
      const result = await useCase.getResultById(req.params.id);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err.message === 'Result not found') {
        return res.status(404).json({
          success: false,
          error: 'Result not found'
        });
      }
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Update a result
   */
  async update(req, res) {
    try {
      const result = await useCase.updateResult(req.params.id, req.body);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err.message === 'Result not found') {
        return res.status(404).json({
          success: false,
          error: 'Result not found'
        });
      }
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Delete a result
   */
  async delete(req, res) {
    try {
      const result = await useCase.deleteResult(req.params.id);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err.message === 'Result not found') {
        return res.status(404).json({
          success: false,
          error: 'Result not found'
        });
      }
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get results by student ID
   */
  async getByStudentId(req, res) {
    try {
      const results = await useCase.getResultsByStudentId(req.params.studentId);
      res.json({
        success: true,
        data: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get results by course offering ID
   */
  async getByCourseOfferingId(req, res) {
    try {
      const results = await useCase.getResultsByCourseOfferingId(req.params.courseOfferingId);
      res.json({
        success: true,
        data: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get results for logged-in student
   */
  async getMyResults(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID missing in token'
        });
      }

      const results = await useCase.getResultsByStudent(userId);
      res.json({
        success: true,
        data: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get results for logged-in lecturer
   */
  async getMyLecturerResults(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID missing in token'
        });
      }

      const results = await useCase.getResultsByLecturer(userId);
      res.json({
        success: true,
        data: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get statistics for a course offering
   */
  async getCourseOfferingStatistics(req, res) {
    try {
      const statistics = await useCase.getCourseOfferingStatistics(req.params.courseOfferingId);
      res.json({
        success: true,
        data: statistics
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Bulk create results
   * Supports both studentId (UUID) and studentNo for student identification
   */
  async bulkCreate(req, res) {
    try {
      // Set enteredBy for all results
      const resultsData = req.body.results.map(result => ({
        ...result,
        enteredBy: req.user.id
      }));

      const result = await useCase.bulkCreateResults(resultsData);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get student GPA data based on their results
   * @param {string} studentId - Student ID from URL params
   * @param {string} semesterId - Optional semester ID from query params
   */
  async getStudentGPA(req, res) {
    try {
      const { studentId } = req.params;
      const { semesterId } = req.query;

      const gpaData = await useCase.calculateStudentGPA(studentId, semesterId);
      res.json({
        success: true,
        data: gpaData
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get comprehensive academic record for a student (overall + semester-wise GPAs)
   */
  async getStudentAcademicRecord(req, res) {
    try {
      const { studentId } = req.params;

      const academicRecord = await useCase.getStudentAcademicRecord(studentId);
      res.json({
        success: true,
        data: academicRecord
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get my GPA data (for logged-in student)
   */
  async getMyGPA(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID missing in token'
        });
      }

      // Find student by userId
      const StudentRepository = require('../repositories/StudentRepository');
      const studentRepo = new StudentRepository();
      const student = await studentRepo.findOne({ userId });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student record not found for this user'
        });
      }

      const { semesterId } = req.query;
      const gpaData = await useCase.calculateStudentGPA(student.id, semesterId);
      
      res.json({
        success: true,
        data: gpaData
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  },

  /**
   * Get my academic record (for logged-in student)
   */
  async getMyAcademicRecord(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID missing in token'
        });
      }

      // Find student by userId
      const StudentRepository = require('../repositories/StudentRepository');
      const studentRepo = new StudentRepository();
      const student = await studentRepo.findOne({ userId });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student record not found for this user'
        });
      }

      const academicRecord = await useCase.getStudentAcademicRecord(student.id);
      
      res.json({
        success: true,
        data: academicRecord
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
};