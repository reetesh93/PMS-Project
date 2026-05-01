const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/dashboard', protect, getDashboardStats);

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('admin'), createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, authorize('admin'), deleteTask);

module.exports = router;
