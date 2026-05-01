const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const normalizeRole = (role) => {
  if (!role) {
    return 'member';
  }

  return String(role).toLowerCase();
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const role = normalizeRole(req.body.role);

  if (!name || !email || !password) {
    return sendResponse(res, 400, false, 'Name, email, and password are required');
  }

  if (password.length < 6) {
    return sendResponse(res, 400, false, 'Password must be at least 6 characters');
  }

  if (!['admin', 'member'].includes(role)) {
    return sendResponse(res, 400, false, 'Role must be admin or member');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendResponse(res, 400, false, 'Email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  return sendResponse(res, 201, true, 'User registered successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token: generateToken(user._id)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, false, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return sendResponse(res, 401, false, 'Invalid email or password');
  }

  return sendResponse(res, 200, true, 'Login successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token: generateToken(user._id)
  });
});

module.exports = {
  register,
  login
};
