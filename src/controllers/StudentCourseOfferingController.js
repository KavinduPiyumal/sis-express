const StudentCourseOfferingUseCase = require('../usecases/StudentCourseOfferingUseCase');
const useCase = new StudentCourseOfferingUseCase();

module.exports = {
  // GET /api/course-offerings/student/myCourses
  async getMyCourses(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID missing in token'
        });
      }
      const offerings = await useCase.getMyCourses(userId);
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

  // GET /api/course-offerings/student/batchAvailable
  async getBatchAvailable(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID missing in token'
        });
      }
      const offerings = await useCase.getBatchAvailableCourses(userId);
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
  }
};
