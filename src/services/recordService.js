const Record = require("../models/Record");

/**
 * Create a new financial record.
 * @param {Object} data - record fields
 * @param {string} userId - ID of the creating user
 * @returns {Object} created record
 */
const createRecord = async (data, userId) => {
  const record = await Record.create({ ...data, createdBy: userId });
  return record;
};

/**
 * Get all records with filtering and pagination.
 *
 * Supported filters: type, category, startDate, endDate
 *
 * @param {Object} filters - { type, category, startDate, endDate }
 * @param {Object} pagination - { page, limit }
 * @returns {Object} { records, total, page, pages }
 */
const getRecords = async (filters = {}, { page = 1, limit = 10 } = {}) => {
  const query = {};

  if (filters.type) query.type = filters.type;

  if (filters.category) {
    query.category = { $regex: filters.category, $options: "i" };
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Record.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v"),
    Record.countDocuments(query),
  ]);

  return {
    records,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

/**
 * Get a single record by ID.
 * @param {string} id
 * @returns {Object} record
 */
const getRecordById = async (id) => {
  const record = await Record.findById(id)
    .populate("createdBy", "name email")
    .select("-__v");

  if (!record) {
    const error = new Error("Record not found.");
    error.statusCode = 404;
    throw error;
  }

  return record;
};

/**
 * Update a record by ID.
 * @param {string} id
 * @param {Object} updates
 * @returns {Object} updated record
 */
const updateRecord = async (id, updates) => {
  const record = await Record.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-__v");

  if (!record) {
    const error = new Error("Record not found.");
    error.statusCode = 404;
    throw error;
  }

  return record;
};

/**
 * Soft delete a record by setting isDeleted = true.
 * The record remains in the DB for audit purposes.
 * @param {string} id
 */
const deleteRecord = async (id) => {
  // Bypass the default isDeleted filter to find record first
  const record = await Record.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!record) {
    const error = new Error("Record not found.");
    error.statusCode = 404;
    throw error;
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
