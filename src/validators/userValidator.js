const { body } = require("express-validator");

const updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"]).withMessage("Role must be viewer, analyst, or admin"),

  body("status")
    .optional()
    .isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),
];

module.exports = { updateUserValidator };
