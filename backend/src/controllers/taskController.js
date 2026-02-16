const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// Get all tasks for current user
const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const query = { user: req.userId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortOrder };

    const tasks = await Task.find(query)
      .sort(sort)
      .limit(parseInt(req.query.limit) || 50)
      .skip(parseInt(req.query.skip) || 0);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        total,
        limit: parseInt(req.query.limit) || 50,
        skip: parseInt(req.query.skip) || 0
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = new Task({
      ...req.body,
      user: req.userId
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
