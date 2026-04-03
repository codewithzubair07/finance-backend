const express = require("express");
const router = express.Router();
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");
const { createRecordValidator, updateRecordValidator } = require("../validators/recordValidator");
const authenticate = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records management
 */

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Get all financial records (paginated + filterable)
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           example: "2024-12-31"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of records
 */
router.get("/", authenticate, roleGuard("viewer", "analyst", "admin"), getRecords);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get a single record by ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record data
 *       404:
 *         description: Record not found
 */
router.get("/:id", authenticate, roleGuard("viewer", "analyst", "admin"), getRecordById);

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create a new financial record (Admin only)
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 example: "2024-03-15"
 *               notes:
 *                 type: string
 *                 example: March salary credit
 *     responses:
 *       201:
 *         description: Record created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post("/", authenticate, roleGuard("admin"), createRecordValidator, createRecord);

/**
 * @swagger
 * /records/{id}:
 *   put:
 *     summary: Update a record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
router.put("/:id", authenticate, roleGuard("admin"), updateRecordValidator, updateRecord);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Soft delete a record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted
 *       404:
 *         description: Record not found
 */
router.delete("/:id", authenticate, roleGuard("admin"), deleteRecord);

module.exports = router;
