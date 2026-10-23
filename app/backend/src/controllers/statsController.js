const { query } = require('../config/db');

async function getStats(req, res, next) {
  try {
    const totalResult = await query('SELECT COUNT(*) AS count FROM tasks');
    const total = parseInt(totalResult.rows[0].count, 10);

    const statusResult = await query(`
      SELECT 
        status, 
        COUNT(*) AS count 
      FROM tasks 
      GROUP BY status
    `);

    const statusCounts = {
      Todo: 0,
      'In Progress': 0,
      Done: 0,
    };

    statusResult.rows.forEach((row) => {
      statusCounts[row.status] = parseInt(row.count, 10);
    });

    const completed = statusCounts['Done'] || 0;
    const inProgress = statusCounts['In Progress'] || 0;
    const pending = statusCounts['Todo'] || 0;

    const completionPercentage = total > 0 
      ? parseFloat(((completed / total) * 100).toFixed(1)) 
      : 0;

    const priorityResult = await query(`
      SELECT 
        priority, 
        COUNT(*) AS count 
      FROM tasks 
      GROUP BY priority
    `);

    const priorityCounts = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    priorityResult.rows.forEach((row) => {
      priorityCounts[row.priority] = parseInt(row.count, 10);
    });

    const categoryResult = await query(`
      SELECT 
        category, 
        COUNT(*) AS count 
      FROM tasks 
      GROUP BY category 
      ORDER BY count DESC
    `);

    // Get recent 5 tasks
    const recentTasksResult = await query(`
      SELECT id, title, category, status, priority, due_date, created_at 
      FROM tasks 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending,
        completionPercentage,
        byPriority: priorityCounts,
        byCategory: categoryResult.rows.map(r => ({ category: r.category, count: parseInt(r.count, 10) })),
        recentTasks: recentTasksResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
};
