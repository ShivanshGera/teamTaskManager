const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const sendResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return sendResponse(res, 400, false, 'Project name and description are required');
  }

  const memberIds = Array.isArray(req.body.members) ? req.body.members : [];
  const uniqueMemberIds = [...new Set([...memberIds, req.user._id.toString()])];

  if (uniqueMemberIds.some((id) => !isObjectId(id))) {
    return sendResponse(res, 400, false, 'All member ids must be valid');
  }

  const memberCount = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
  if (memberCount !== uniqueMemberIds.length) {
    return sendResponse(res, 400, false, 'One or more members do not exist');
  }

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    members: uniqueMemberIds
  });

  const populatedProject = await Project.findById(project._id)
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role');

  return sendResponse(res, 201, true, 'Project created successfully', {
    project: populatedProject
  });
});

const getProjects = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? { $or: [{ createdBy: req.user._id }, { members: req.user._id }] }
      : { members: req.user._id };

  const projects = await Project.find(filter)
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role')
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, true, 'Projects fetched successfully', {
    projects
  });
});

const updateProjectMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, userId } = req.body;

  if (!isObjectId(id)) {
    return sendResponse(res, 400, false, 'Project id is invalid');
  }

  if (!['add', 'remove'].includes(action) || !userId || !isObjectId(userId)) {
    return sendResponse(res, 400, false, 'Action must be add or remove, and userId must be valid');
  }

  const project = await Project.findById(id);
  if (!project) {
    return sendResponse(res, 404, false, 'Project not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  const memberSet = new Set(project.members.map((memberId) => memberId.toString()));

  if (action === 'add') {
    memberSet.add(userId);
  }

  if (action === 'remove') {
    if (project.createdBy.toString() === userId) {
      return sendResponse(res, 400, false, 'Project creator cannot be removed from members');
    }

    memberSet.delete(userId);
  }

  project.members = [...memberSet];
  await project.save();

  const populatedProject = await Project.findById(project._id)
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role');

  return sendResponse(res, 200, true, 'Project members updated successfully', {
    project: populatedProject
  });
});

module.exports = {
  createProject,
  getProjects,
  updateProjectMembers
};
