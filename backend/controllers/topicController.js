const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');

// @desc    Get topics for a subject, with pagination + search + filter
// @route   GET /api/topics/:subjectId
const getTopics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Filters
    const filter = { subjectId, userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    // Search by title
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Sort
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const [topics, total] = await Promise.all([
      Topic.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      Topic.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      topics,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create topic
// @route   POST /api/topics
const createTopic = async (req, res) => {
  try {
    const { subjectId, title, status, priority, deadline, notes, resources } = req.body;

    if (!subjectId || !title) {
      return res.status(400).json({ success: false, message: 'subjectId and title are required.' });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    const topic = await Topic.create({
      subjectId,
      userId: req.user._id,
      title,
      status: status || 'Not Started',
      priority: priority || 'Medium',
      deadline: deadline || null,
      notes: notes || '',
      resources: resources || [],
      minutesSpent: 0,
    });

    res.status(201).json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.user._id });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });

    const { title, status, priority, deadline, notes, resources, minutesSpent } = req.body;
    if (title !== undefined) topic.title = title;
    if (status !== undefined) topic.status = status;
    if (priority !== undefined) topic.priority = priority;
    if (deadline !== undefined) topic.deadline = deadline || null;
    if (notes !== undefined) topic.notes = notes;
    if (resources !== undefined) topic.resources = resources;
    if (minutesSpent !== undefined) topic.minutesSpent = minutesSpent;

    await topic.save();
    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete topic + its sessions
// @route   DELETE /api/topics/:id
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.user._id });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });

    await StudySession.deleteMany({ topicId: topic._id });
    await topic.deleteOne();

    res.json({ success: true, message: 'Topic and all sessions deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTopics, createTopic, updateTopic, deleteTopic };