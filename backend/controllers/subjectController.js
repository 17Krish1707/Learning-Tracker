const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const StudySession = require('../models/StudySession');

// @desc    Get all subjects for logged-in user
// @route   GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id })
      .populate('folderId', 'name emoji color')
      .sort({ createdAt: -1 });

    // Attach topic counts to each subject
    const enriched = await Promise.all(
      subjects.map(async (subject) => {
        const total = await Topic.countDocuments({ subjectId: subject._id });
        const completed = await Topic.countDocuments({ subjectId: subject._id, status: 'Completed' });
        return {
          ...subject.toObject(),
          topicCount: total,
          completedCount: completed,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );

    res.json({ success: true, count: enriched.length, subjects: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const { name, color, iconName, folderId } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      color,
      iconName,
      folderId: folderId || null,
    });

    res.status(201).json({ success: true, subject });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Subject with this name already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    const { name, color, iconName, folderId } = req.body;
    if (name) subject.name = name;
    if (color) subject.color = color;
    if (iconName) subject.iconName = iconName;
    if (folderId !== undefined) subject.folderId = folderId || null;

    await subject.save();
    res.json({ success: true, subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete subject (and its topics + sessions)
// @route   DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });

    // Cascade delete topics and their sessions
    const topics = await Topic.find({ subjectId: subject._id });
    const topicIds = topics.map((t) => t._id);
    await StudySession.deleteMany({ topicId: { $in: topicIds } });
    await Topic.deleteMany({ subjectId: subject._id });
    await subject.deleteOne();

    res.json({ success: true, message: 'Subject and all related data deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };