const { validationResult } = require("express-validator");
const recordService = require("../services/recordService");

/**
 * POST /api/records
 * Create a new financial record. Admin only.
 */
const createRecord = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const record = await recordService.createRecord(req.body, req.user._id);
    res.status(201).json({ success: true, message: "Record created.", data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/records
 * Get all records with optional filters and pagination. All roles.
 * Query params: type, category, startDate, endDate, page, limit
 */
const getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
    const result = await recordService.getRecords(
      { type, category, startDate, endDate },
      { page, limit }
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/records/:id
 * Get a single record. All roles.
 */
const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/records/:id
 * Update a record. Admin only.
 */
const updateRecord = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { amount, type, category, date, notes } = req.body;
    const updates = {};
    if (amount !== undefined) updates.amount = amount;
    if (type !== undefined) updates.type = type;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    const record = await recordService.updateRecord(req.params.id, updates);
    res.status(200).json({ success: true, message: "Record updated.", data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/records/:id
 * Soft delete a record. Admin only.
 */
const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    res.status(200).json({ success: true, message: "Record deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
