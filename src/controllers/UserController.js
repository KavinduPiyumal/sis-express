
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
      const users = await this.userUseCase.getUsersByRole(req.user.role, role, req.query);
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
      // Pass req.query as options so limit/page are respected
      const students = await this.userUseCase.getUsersByRole(req.user.role, 'student', req.query);
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
      const admins = await this.userUseCase.getUsersByRole(req.user.role, 'admin', req.query);
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

    // Bulk create students
    bulkCreateStudents = async (req, res, next) => {
      try {
        const { students } = req.body;
        if (!Array.isArray(students) || students.length === 0) {
          return res.status(400).json({ success: false, message: 'students array required' });
        }
        const created = [];
        const failed = [];
        for (const studentData of students) {
          try {
            // Use studentNo for Student creation, not studentId
            const user = await this.userUseCase.createUser({
              ...studentData,
              role: 'student',
              studentNo: studentData.studentNo || studentData.studentId, // fallback for legacy
              parentName: studentData.parentName,
              parentPhone: studentData.parentPhone,
              emergencyContactName: studentData.emergencyContactName,
              emergencyContactPhone: studentData.emergencyContactPhone,
              gender: studentData.gender
            }, req.user.role);
            created.push(user);
          } catch (err) {
            failed.push({ error: err.message, data: studentData });
          }
        }
        res.status(201).json({ success: true, created, failed });
      } catch (error) {
        next(error);
      }
    };

  // Bulk create lecturers
  bulkCreateLecturers = async (req, res, next) => {
    try {
      const { lecturers } = req.body;
      if (!Array.isArray(lecturers) || lecturers.length === 0) {
        return res.status(400).json({ success: false, message: 'lecturers array required' });
      }
      const created = [];
      const failed = [];
      for (const lecturerData of lecturers) {
        // Per-lecturer validation
        let errors = [];
        if (!lecturerData.firstName) errors.push({ field: 'firstName', message: 'First name is required' });
        if (!lecturerData.lastName) errors.push({ field: 'lastName', message: 'Last name is required' });
        if (!lecturerData.email || !/^\S+@\S+\.\S+$/.test(lecturerData.email)) errors.push({ field: 'email', message: 'Valid email is required' });
        if (!['student', 'admin', 'super_admin'].includes(lecturerData.role || 'admin')) errors.push({ field: 'role', message: 'Invalid role' });
        if ((lecturerData.role === 'admin' || !lecturerData.role) && lecturerData.isLecturer === true && !lecturerData.departmentId) errors.push({ field: 'departmentId', message: 'Department ID is required for lecturers' });
        if (lecturerData.password && lecturerData.password.length < 6) errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
        if (errors.length > 0) {
          failed.push({ errors, data: lecturerData });
          continue;
        }
        try {
          const user = await this.userUseCase.createUser({ ...lecturerData, role: 'admin', isLecturer: true, gender: lecturerData.gender }, req.user.role);
          created.push(user);
        } catch (err) {
          failed.push({ error: err.message, data: lecturerData });
        }
      }
      res.status(201).json({ success: true, created, failed });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
