const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');
const User = require('../models/User');

// @desc    Get aggregated stats for the logged-in user
// @route   GET /api/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, subjects, topics, sessions] = await Promise.all([
      User.findById(userId).select('streakDays lastStudiedAt studyGoal weeklyTarget'),
      Subject.countDocuments({ userId }),
      Topic.find({ userId }),
      StudySession.find({ userId }).sort({ date: -1 }),
    ]);

    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.status === 'Completed').length;
    const inProgressTopics = topics.filter((t) => t.status === 'In Progress').length;
    const totalHours = parseFloat((topics.reduce((sum, t) => sum + (t.minutesSpent || 0), 0) / 60).toFixed(2));
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Hours studied this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = sessions.filter((s) => new Date(s.date) >= weekAgo);
    const hoursThisWeek = parseFloat((weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(2));

    // Hours studied today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter((s) => new Date(s.date) >= todayStart);
    const hoursToday = parseFloat((todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(2));

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = topics
      .filter((t) => t.deadline && new Date(t.deadline) <= nextWeek && t.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
      .map((t) => ({ id: t._id, title: t.title, deadline: t.deadline, status: t.status }));

    // Daily activity — last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = sessions.filter((s) => new Date(s.date) >= thirtyDaysAgo);

    const dailyActivity = {};
    recentSessions.forEach((s) => {
      const day = new Date(s.date).toISOString().split('T')[0];
      dailyActivity[day] = parseFloat(((dailyActivity[day] || 0) + s.duration / 60).toFixed(2));
    });

    res.json({
      success: true,
      stats: {
        streak: user.streakDays,
        lastStudiedAt: user.lastStudiedAt,
        subjects: subjects,
        totalTopics,
        completedTopics,
        inProgressTopics,
        totalHours,
        hoursThisWeek,
        hoursToday,
        progressPercent,
        upcomingDeadlines,
        dailyActivity,
        studyGoal: user.studyGoal,
        weeklyTarget: user.weeklyTarget,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get per-subject stats
// @route   GET /api/stats/subjects
const getSubjectStats = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });

    const stats = await Promise.all(
      subjects.map(async (subject) => {
        const topics = await Topic.find({ subjectId: subject._id });
        const total = topics.length;
        const completed = topics.filter((t) => t.status === 'Completed').length;
        const hours = parseFloat((topics.reduce((sum, t) => sum + (t.minutesSpent || 0), 0) / 60).toFixed(2));

        return {
          subjectId: subject._id,
          name: subject.name,
          color: subject.color,
          total,
          completed,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
          hours,
        };
      })
    );

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats, getSubjectStats };