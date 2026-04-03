const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generate a signed JWT token for a user.
 * @param {string} id - User's MongoDB ObjectId
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Register a new user.
 * @param {Object} userData - { name, email, password, role }
 * @returns {Object} { user, token }
 */
const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already in use.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    token,
  };
};

/**
 * Log in an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, token }
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "inactive") {
    const error = new Error("Your account is inactive. Contact an admin.");
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    token,
  };
};

module.exports = { registerUser, loginUser, generateToken };
