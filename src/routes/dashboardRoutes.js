const express = require("express");
const router = express.Router();
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
} = require("../controllers/dashboardController");
const authenticate = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

// All dashboard routes require authentication + analyst or admin role
router.use(authenticate, roleGuard("analyst", "admin"));

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and summary APIs (Analyst + Admin)
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get overall financial summary
 *     tags: [Dashboard]
 *     description: Returns total income, total expenses, net balance, and record counts.
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalIncome: 150000
 *                 totalExpenses: 80000
 *                 netBalance: 70000
 *                 incomeCount: 12
 *                 expenseCount: 35
 *                 totalRecords: 47
 */
router.get("/summary", getSummary);

/**
 * @swagger
 * /dashboard/categories:
 *   get:
 *     summary: Get income and expense breakdown by category
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Category-wise totals
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - category: Salary
 *                   type: income
 *                   total: 120000
 *                   count: 6
 *                 - category: Food
 *                   type: expense
 *                   total: 15000
 *                   count: 20
 */
router.get("/categories", getCategoryBreakdown);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Get monthly income vs expense trends
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of past months to include (1–24)
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
router.get("/trends", getMonthlyTrends);

/**
 * @swagger
 * /dashboard/recent:
 *   get:
 *     summary: Get most recent financial activity
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recent records to return (1–50)
 *     responses:
 *       200:
 *         description: Recent activity records
 */
router.get("/recent", getRecentActivity);

module.exports = router;
