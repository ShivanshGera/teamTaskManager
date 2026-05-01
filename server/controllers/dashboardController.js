const Task = require('../models/Task');
const sendResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const buildTaskFilter = (user) => {
  if (user.role === 'admin') {
    return {};
  }

  return { assignedTo: user._id };
};

const getDashboard = asyncHandler(async (req, res) => {
  const filter = buildTaskFilter(req.user);
  const now = new Date();

  const [totalTasks, tasksByStatus, tasksPerUser, overdueTasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]),
    Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          name: '$user.name',
          email: '$user.email',
          count: 1
        }
      },
      { $sort: { count: -1, name: 1 } }
    ]),
    Task.find({
      ...filter,
      dueDate: { $lt: now },
      status: { $ne: 'Done' }
    })
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role')
      .sort({ dueDate: 1 })
  ]);

  const statusMap = {
    'To Do': 0,
    'In Progress': 0,
    Done: 0
  };

  tasksByStatus.forEach((item) => {
    statusMap[item.status] = item.count;
  });

  return sendResponse(res, 200, true, 'Dashboard fetched successfully', {
    totalTasks,
    tasksByStatus: statusMap,
    tasksPerUser,
    overdueTasks,
    overdueTaskCount: overdueTasks.length
  });
});

module.exports = {
  getDashboard
};
