const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Specific role checkers
const requireSuperAdmin = authorize('super_admin');
const requireAdmin = authorize('admin', 'super_admin');
const requireStudent = authorize('student');
const requireAdminOrSuperAdmin = authorize('admin', 'super_admin');
const requireAnyRole = authorize('student', 'admin', 'super_admin');

// Check if user is accessing their own resource
const checkOwnership = (req, res, next) => {
  const userId = req.params.id || req.params.userId || req.params.studentId;
  
  // Super admins and admins can access any resource
  if (req.user.role === 'super_admin' || req.user.role === 'admin') {
    return next();
  }
  
  // Students can only access their own resources
  if (req.user.role === 'student' && req.user.id === userId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'You can only access your own resources'
  });
};

// Check if student is accessing their own resource
const checkStudentOwnership = (req, res, next) => {
  const studentId = req.params.studentId || req.query.studentId || req.body.studentId;
  
  // Admins and super admins can access any student resource
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return next();
  }
  
  // Students can only access their own resources
  if (req.user.role === 'student' && req.user.id === studentId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'You can only access your own resources'
  });
};

module.exports = {
  authorize,
  requireSuperAdmin,
  requireAdmin,
  requireStudent,
  requireAdminOrSuperAdmin,
  requireAnyRole,
  checkOwnership,
  checkStudentOwnership
};
