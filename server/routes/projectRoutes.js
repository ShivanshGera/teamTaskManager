const express = require('express');
const {
  createProject,
  getProjects,
  updateProjectMembers
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, authorize('admin'), createProject).get(protect, getProjects);
router.put('/:id/members', protect, authorize('admin'), updateProjectMembers);

module.exports = router;
