const DashboardUseCase = require('../usecases/DashboardUseCase');
const dashboardUseCase = new DashboardUseCase();

class DashboardController {
  async getStudentDashboard(req, res, next) {
    try {
      const data = await dashboardUseCase.getStudentDashboard(req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getLecturerDashboard(req, res, next) {
    try {
      const data = await dashboardUseCase.getLecturerDashboard(req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();