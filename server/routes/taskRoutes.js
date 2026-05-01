const express = require('express');
const { createTask, getTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, authorize('admin'), createTask).get(protect, getTasks);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
