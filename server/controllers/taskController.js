const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const sendResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const statuses = ['To Do', 'In Progress', 'Done'];
const priorities = ['low', 'medium', 'high'];

const createTask = asyncHandler(async (req, res) => {
  const { title, description, projectId, assignedTo, dueDate } = req.body;
  const status = req.body.status || 'To Do';
  const priority = req.body.priority || 'medium';

  if (!title || !description || !projectId || !assignedTo || !dueDate) {
    return sendResponse(
      res,
      400,
      false,
      'Title, description, projectId, assignedTo, and dueDate are required'
    );
  }

  if (!isObjectId(projectId) || !isObjectId(assignedTo)) {
    return sendResponse(res, 400, false, 'Project id and assigned user id must be valid');
  }

  if (!statuses.includes(status)) {
    return sendResponse(res, 400, false, 'Status must be To Do, In Progress, or Done');
  }

  if (!priorities.includes(priority)) {
    return sendResponse(res, 400, false, 'Priority must be low, medium, or high');
  }

  const parsedDueDate = new Date(dueDate);
  if (Number.isNaN(parsedDueDate.getTime())) {
    return sendResponse(res, 400, false, 'Due date must be a valid date');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return sendResponse(res, 404, false, 'Project not found');
  }

  const assignedUser = await User.findById(assignedTo);
  if (!assignedUser) {
    return sendResponse(res, 404, false, 'Assigned user not found');
  }

  const isProjectMember = project.members.some((memberId) => memberId.toString() === assignedTo);
  if (!isProjectMember) {
    return sendResponse(res, 400, false, 'Assigned user must be a project member');
  }

  const task = await Task.create({
    title,
    description,
    projectId,
    assignedTo,
    status,
    priority,
    dueDate: parsedDueDate
  });

  const populatedTask = await Task.findById(task._id)
    .populate('projectId', 'name description')
    .populate('assignedTo', 'name email role');

  return sendResponse(res, 201, true, 'Task created successfully', {
    task: populatedTask
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

  if (req.query.projectId) {
    if (!isObjectId(req.query.projectId)) {
      return sendResponse(res, 400, false, 'Project id is invalid');
    }
    filter.projectId = req.query.projectId;
  }

  if (req.query.status) {
    if (!statuses.includes(req.query.status)) {
      return sendResponse(res, 400, false, 'Status filter is invalid');
    }
    filter.status = req.query.status;
  }

  const tasks = await Task.find(filter)
    .populate('projectId', 'name description')
    .populate('assignedTo', 'name email role')
    .sort({ dueDate: 1, createdAt: -1 });

  return sendResponse(res, 200, true, 'Tasks fetched successfully', {
    tasks
  });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isObjectId(id)) {
    return sendResponse(res, 400, false, 'Task id is invalid');
  }

  if (!status || !statuses.includes(status)) {
    return sendResponse(res, 400, false, 'Status must be To Do, In Progress, or Done');
  }

  const task = await Task.findById(id);
  if (!task) {
    return sendResponse(res, 404, false, 'Task not found');
  }

  if (task.assignedTo.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, false, 'Only the assigned user can update this task status');
  }

  task.status = status;
  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('projectId', 'name description')
    .populate('assignedTo', 'name email role');

  return sendResponse(res, 200, true, 'Task status updated successfully', {
    task: populatedTask
  });
});

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus
};
