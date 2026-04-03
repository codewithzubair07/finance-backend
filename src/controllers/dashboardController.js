const dashboardService = require("../services/dashboardService");

/**
 * GET /api/dashboard/summary
 * Get total income, expenses, net balance. Analyst + Admin.
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/categories
 * Get spending/income breakdown by category. Analyst + Admin.
 */
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown();
    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/trends
 * Get monthly income vs expense trends. Analyst + Admin.
 * Query param: months (default 6)
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    if (months < 1 || months > 24) {
      return res.status(400).json({
        success: false,
        message: "months must be between 1 and 24.",
      });
    }

    const trends = await dashboardService.getMonthlyTrends(months);
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/recent
 * Get the most recent financial activity. Analyst + Admin.
 * Query param: limit (default 5)
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "limit must be between 1 and 50.",
      });
    }

    const activity = await dashboardService.getRecentActivity(limit);
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity };
