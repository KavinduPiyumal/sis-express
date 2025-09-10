const UserUseCase = require('../usecases/UserUseCase');

class UserController {
  constructor() {
    this.userUseCase = new UserUseCase();
  }

  createUser = async (req, res, next) => {
    try {
      const user = await this.userUseCase.createUser(req.body, req.user.role);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req, res, next) => {
    try {
      const { page, limit, search, role } = req.query;
      const options = { page, limit, search, roleFilter: role };
      
      const result = await this.userUseCase.getAllUsers(req.user.role, options);
      
      res.json({
        success: true,
        data: result.users,
        meta: {
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getUsersByRole = async (req, res, next) => {
    try {
      const { role } = req.params;
      const users = await this.userUseCase.getUsersByRole(req.user.role, role);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  getStudents = async (req, res, next) => {
    try {
      const students = await this.userUseCase.getUsersByRole(req.user.role, 'student');
      
      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      next(error);
    }
  };

  getAdmins = async (req, res, next) => {
    try {
      const admins = await this.userUseCase.getUsersByRole(req.user.role, 'admin');
      
      res.json({
        success: true,
        data: admins
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.userUseCase.getUserById(id, req.user.id, req.user.role);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.userUseCase.updateUser(
        id,
        req.body,
        req.user.id,
        req.user.role
      );
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.userUseCase.deleteUser(id, req.user.role);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  getUserStats = async (req, res, next) => {
    try {
      const stats = await this.userUseCase.getUserStats(req.user.role);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
