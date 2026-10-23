const VALID_STATUSES = ['Todo', 'In Progress', 'Done'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_SORT_FIELDS = ['due_date', 'created_at', 'title', 'priority', 'status'];

function validateCreateTask(req, res, next) {
  const { title, description, category, status, priority, due_date } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Task title is required and cannot be empty.');
  } else if (title.trim().length > 255) {
    errors.push('Task title cannot exceed 255 characters.');
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('Task description must be a string.');
  }

  if (category !== undefined && category !== null && typeof category !== 'string') {
    errors.push('Task category must be a string.');
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (due_date) {
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid due_date format. Please provide a valid date string.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.cleanedTask = {
    title: title.trim(),
    description: description ? description.trim() : '',
    category: category ? category.trim() : 'General',
    status: status || 'Todo',
    priority: priority || 'Medium',
    due_date: due_date ? new Date(due_date).toISOString().split('T')[0] : null,
  };

  next();
}

function validateUpdateTask(req, res, next) {
  const { title, description, category, status, priority, due_date } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push('Task title cannot be empty.');
    } else if (title.trim().length > 255) {
      errors.push('Task title cannot exceed 255 characters.');
    }
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (due_date !== undefined && due_date !== null && due_date !== '') {
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid due_date format. Please provide a valid date string.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

function validateIdParam(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID. ID must be a positive integer.',
    });
  }
  req.taskId = id;
  next();
}

function validateQueryParams(req, res, next) {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const sortBy = req.query.sortBy || 'created_at';
  const order = (req.query.order || 'DESC').toUpperCase();
  const search = req.query.search ? req.query.search.trim() : '';
  const status = req.query.status ? req.query.status.trim() : '';
  const priority = req.query.priority ? req.query.priority.trim() : '';
  const category = req.query.category ? req.query.category.trim() : '';

  req.pagination = {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 10,
    sortBy: VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'created_at',
    order: order === 'ASC' ? 'ASC' : 'DESC',
    search,
    status: VALID_STATUSES.includes(status) ? status : '',
    priority: VALID_PRIORITIES.includes(priority) ? priority : '',
    category,
  };

  next();
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateIdParam,
  validateQueryParams,
  VALID_STATUSES,
  VALID_PRIORITIES,
};
