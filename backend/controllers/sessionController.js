const StudySession = require('../models/StudySession');
const Topic = require('../models/Topic');
const User = require('../models/User');

// Helper: calculate streak
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!user.lastStudiedAt) {
    user.streakDays = 1;
  } else {
    const lastDate = new Date(user.lastStudiedAt);
    lastDate.setHours(0, 0, 0, 0);

    if (lastDate.getTime() === today.getTime()) {
      // Already studied today, no change
    } else if (lastDate.getTime() === yesterday.getTime()) {
      // Consecutive day
      user.streakDays += 1;
    } else {
      // Streak broken
      user.streakDays = 1;
    }
  }

  user.lastStudiedAt = new Date();
  await user.save();
  return user.streakDays;
};

// @desc    Log a study session
// @route   POST /api/sessions
const createSession = async (req, res) => {
  try {
    const { topicId, duration, date, notes } = req.body;

    if (!topicId || !duration) {
      return res.status(400).json({ success: false, message: 'topicId and duration are required.' });
    }

    // Verify topic belongs to user
    const topic = await Topic.findOne({ _id: topicId, userId: req.user._id });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });

    const session = await StudySession.create({
      topicId,
      userId: req.user._id,
      duration,
      date: date || new Date(),
      notes: notes || '',
    });

    // Update topic's total hours
    topic.hoursSpent = parseFloat((topic.hoursSpent + duration).toFixed(2));
    await topic.save();

    // Update user streak
    const streakDays = await updateStreak(req.user._id);

    res.status(201).json({ success: true, session, streakDays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all sessions for a topic
// @route   GET /api/sessions/:topicId
const getSessionsByTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.topicId, userId: req.user._id });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });

    const sessions = await StudySession.find({ topicId: req.params.topicId })
      .sort({ date: -1 });

    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0);

    res.json({
      success: true,
      count: sessions.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      sessions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a session (and subtract hours from topic)
// @route   DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    // Subtract hours from topic
    const topic = await Topic.findById(session.topicId);
    if (topic) {
      topic.hoursSpent = Math.max(0, parseFloat((topic.hoursSpent - session.duration).toFixed(2)));
      await topic.save();
    }

    await session.deleteOne();
    res.json({ success: true, message: 'Session deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/sessions — all sessions for logged-in user, populated
const getAllSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .populate({ path: 'topicId', select: 'title subjectId', populate: { path: 'subjectId', select: 'name' } })
      .sort({ date: -1 })
      .limit(200);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Add to module.exports

module.exports = { createSession, getSessionsByTopic, getAllSessions, deleteSession };