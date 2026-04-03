const { body } = require("express-validator");

const createRecordValidator = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),

  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(["income", "expense"]).withMessage("Type must be income or expense"),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required")
    .isLength({ max: 50 }).withMessage("Category cannot exceed 50 characters"),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date (e.g. 2024-03-15)"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

const updateRecordValidator = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),

  body("type")
    .optional()
    .isIn(["income", "expense"]).withMessage("Type must be income or expense"),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("Category cannot exceed 50 characters"),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

module.exports = { createRecordValidator, updateRecordValidator };
