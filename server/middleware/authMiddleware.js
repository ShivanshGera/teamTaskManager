const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, 401, false, 'Authorization token is required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendResponse(res, 401, false, 'User for this token no longer exists');
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid or expired token');
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return sendResponse(res, 401, false, 'Authentication is required');
  }

  if (!roles.includes(req.user.role)) {
    return sendResponse(res, 403, false, 'You are not authorized to perform this action');
  }

  return next();
};

module.exports = {
  protect,
  authorize
};
