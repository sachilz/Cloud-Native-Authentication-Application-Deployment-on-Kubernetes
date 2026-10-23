const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateIdParam,
  validateQueryParams,
} = require('../middleware/validator');

const router = express.Router();

router.get('/', validateQueryParams, getTasks);
router.get('/:id', validateIdParam, getTaskById);
router.post('/', validateCreateTask, createTask);
router.put('/:id', validateIdParam, validateUpdateTask, updateTask);
router.delete('/:id', validateIdParam, deleteTask);

module.exports = router;
