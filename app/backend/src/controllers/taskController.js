const { query } = require('../config/db');

async function getTasks(req, res, next) {
  try {
    const { page, limit, sortBy, order, search, status, priority, category } = req.pagination;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (priority) {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const pIndex = params.length;
      conditions.push(`(title ILIKE $${pIndex} OR description ILIKE $${pIndex})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `SELECT COUNT(*) AS total FROM tasks ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch tasks with pagination & sorting
    const dataParams = [...params];
    dataParams.push(limit);
    const limitIndex = dataParams.length;
    dataParams.push(offset);
    const offsetIndex = dataParams.length;

    // Sanitize sort column and order
    const safeSortBy = ['due_date', 'created_at', 'title', 'priority', 'status'].includes(sortBy) 
      ? sortBy 
      : 'created_at';
    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const dataSql = `
      SELECT id, title, description, category, status, priority, due_date, created_at, updated_at
      FROM tasks
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeOrder} NULLS LAST
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;

    const dataResult = await query(dataSql, dataParams);

    res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const { taskId } = req;
    const sql = `
      SELECT id, title, description, category, status, priority, due_date, created_at, updated_at
      FROM tasks
      WHERE id = $1
    `;
    const result = await query(sql, [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, category, status, priority, due_date } = req.cleanedTask;

    const sql = `
      INSERT INTO tasks (title, description, category, status, priority, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, description, category, status, priority, due_date, created_at, updated_at
    `;

    const result = await query(sql, [title, description, category, status, priority, due_date]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { taskId } = req;
    const { title, description, category, status, priority, due_date } = req.body;

    // Check if task exists
    const checkSql = 'SELECT id FROM tasks WHERE id = $1';
    const checkResult = await query(checkSql, [taskId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found.`,
      });
    }

    const updates = [];
    const params = [];

    if (title !== undefined) {
      params.push(title.trim());
      updates.push(`title = $${params.length}`);
    }

    if (description !== undefined) {
      params.push(description ? description.trim() : '');
      updates.push(`description = $${params.length}`);
    }

    if (category !== undefined) {
      params.push(category ? category.trim() : 'General');
      updates.push(`category = $${params.length}`);
    }

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    if (priority !== undefined) {
      params.push(priority);
      updates.push(`priority = $${params.length}`);
    }

    if (due_date !== undefined) {
      const formattedDate = due_date ? new Date(due_date).toISOString().split('T')[0] : null;
      params.push(formattedDate);
      updates.push(`due_date = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(taskId);
    const idIndex = params.length;

    const sql = `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${idIndex}
      RETURNING id, title, description, category, status, priority, due_date, created_at, updated_at
    `;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { taskId } = req;
    const sql = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
    const result = await query(sql, [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Task ${taskId} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
