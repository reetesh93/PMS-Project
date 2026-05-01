const mongoose = require('mongoose');
const Task = require('./models/Task');
const Project = require('./models/Project');
require('dotenv').config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const filter = {};
    const now = new Date();

    const tasksByProject = await Task.aggregate([
      { $match: filter },
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { projectName: '$project.name', count: 1, color: '$project.color' } },
    ]);
    console.log(tasksByProject);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
};
test();
