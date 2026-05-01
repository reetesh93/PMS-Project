const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks (admin: all, member: assigned tasks)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, projectId, search } = req.query;

    let filter = {};

    // Role-based filter
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (projectId) filter.projectId = projectId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name color')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Admin only
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name color')
      .populate('createdBy', 'name');

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task (admin: all fields, member: status only)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update their own task's status
    if (req.user.role === 'member') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      // Members can only change status
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name color')
        .populate('createdBy', 'name');

      return res.json({ success: true, task: updatedTask });
    }

    // Admin can update all fields
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name color')
      .populate('createdBy', 'name');

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin only
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const filter = req.user.role === 'member' ? { assignedTo: req.user._id } : {};
    const now = new Date();

    const [total, done, inProgress, pending, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'Done' }),
      Task.countDocuments({ ...filter, status: 'In Progress' }),
      Task.countDocuments({ ...filter, status: 'Pending' }),
      Task.countDocuments({ ...filter, status: { $ne: 'Done' }, dueDate: { $lt: now } }),
    ]);

    // Tasks per project
    const tasksByProject = await Task.aggregate([
      { $match: filter },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { projectName: '$project.name', count: 1, color: '$project.color' } },
    ]);

    // Recent tasks
    const recentTasks = await Task.find(filter)
      .populate('assignedTo', 'name')
      .populate('projectId', 'name color')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: { total, done, inProgress, pending, overdue },
      tasksByProject,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getDashboardStats };
