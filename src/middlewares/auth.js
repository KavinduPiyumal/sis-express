const jwt = require('jsonwebtoken');
const config = require('../config');
const { UserRepository } = require('../repositories');
const logger = require('../config/logger');

const userRepository = new UserRepository();

const authenticate = async (req, res, next) => {
  try {
    // Only accept JWT from HttpOnly cookie
    const token = req.cookies && req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = authenticate;
