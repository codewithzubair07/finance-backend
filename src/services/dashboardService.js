const Record = require("../models/Record");

/**
 * Get overall financial summary.
 * Returns total income, total expenses, and net balance.
 * @returns {Object} summary
 */
const getSummary = async () => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 };

  result.forEach(({ _id, total, count }) => {
    if (_id === "income") {
      summary.totalIncome = total;
      summary.incomeCount = count;
    } else if (_id === "expense") {
      summary.totalExpenses = total;
      summary.expenseCount = count;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  summary.totalRecords = summary.incomeCount + summary.expenseCount;

  return summary;
};

/**
 * Get totals broken down by category.
 * @returns {Array} [{ category, type, total, count }]
 */
const getCategoryBreakdown = async () => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  return result;
};

/**
 * Get monthly income vs expense trends for the past N months.
 * @param {number} months - Number of months to look back (default 6)
 * @returns {Array} monthly trend data
 */
const getMonthlyTrends = async (months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const result = await Record.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: { year: "$_id.year", month: "$_id.month" },
        entries: {
          $push: { type: "$_id.type", total: "$total", count: "$count" },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        income: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$entries",
                    as: "e",
                    cond: { $eq: ["$$e.type", "income"] },
                  },
                },
                0,
              ],
            },
            { total: 0, count: 0 },
          ],
        },
        expense: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$entries",
                    as: "e",
                    cond: { $eq: ["$$e.type", "expense"] },
                  },
                },
                0,
              ],
            },
            { total: 0, count: 0 },
          ],
        },
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return result;
};

/**
 * Get the most recent N financial records.
 * @param {number} limit - Number of records to return (default 5)
 * @returns {Array} recent records
 */
const getRecentActivity = async (limit = 5) => {
  const records = await Record.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("-__v");

  return records;
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
};
