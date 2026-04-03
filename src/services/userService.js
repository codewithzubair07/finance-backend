const User = require("../models/User");

/**
 * Get all users with optional pagination.
 * @param {Object} options - { page, limit }
 * @returns {Object} { users, total, page, pages }
 */
const getAllUsers = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).select("-__v"),
    User.countDocuments(),
  ]);

  return {
    users,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

/**
 * Get a single user by ID.
 * @param {string} id
 * @returns {Object} user
 */
const getUserById = async (id) => {
  const user = await User.findById(id).select("-__v");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Update a user's details (name, role, status, email).
 * Admins cannot demote themselves.
 * @param {string} id - Target user ID
 * @param {Object} updates
 * @param {Object} requestingUser - The user making the request
 * @returns {Object} updated user
 */
const updateUser = async (id, updates, requestingUser) => {
  // Prevent admin from accidentally deactivating their own account
  if (
    requestingUser._id.toString() === id &&
    updates.status === "inactive"
  ) {
    const error = new Error("You cannot deactivate your own account.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-__v");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Delete a user by ID.
 * Admins cannot delete themselves.
 * @param {string} id
 * @param {Object} requestingUser
 */
const deleteUser = async (id, requestingUser) => {
  if (requestingUser._id.toString() === id) {
    const error = new Error("You cannot delete your own account.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
