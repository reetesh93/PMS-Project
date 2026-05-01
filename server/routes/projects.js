const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

router.post('/:id/members', protect, authorize('admin'), addMembers);
router.delete('/:id/members/:userId', protect, authorize('admin'), removeMember);

module.exports = router;
