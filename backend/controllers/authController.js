const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        studyGoal: user.studyGoal,
        weeklyTarget: user.weeklyTarget,
        streakDays: user.streakDays,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        studyGoal: user.studyGoal,
        weeklyTarget: user.weeklyTarget,
        streakDays: user.streakDays,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/me
const updateMe = async (req, res) => {
  try {
    const allowedFields = ['name', 'avatar', 'picture', 'studyGoal', 'weeklyTarget'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle password update separately
    if (req.body.password) {
      const user = await User.findById(req.user._id);
      user.password = req.body.password;
      Object.assign(user, updates);
      await user.save();
      return res.json({ success: true, message: 'Profile updated.' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const { OAuth2Client } = require('google-auth-library');
// npm install google-auth-library

const googleClient = new OAuth2Client();

// @desc    Google OAuth login
// @route   POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ success: false, message: 'Access token required.' });

    // Fetch user info from Google using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) return res.status(401).json({ success: false, message: 'Invalid Google token.' });

    const { name, email, picture, sub: googleId } = await googleRes.json();

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Generate a random password for Google users (they'll never use it)
      const randomPassword = Math.random().toString(36).slice(-16) + 'Aa1!';
      user = await User.create({ name, email, password: randomPassword, avatar: '🎓' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture,           // Google profile picture URL
        avatar: user.avatar,
        streakDays: user.streakDays,
        studyGoal: user.studyGoal,
        weeklyTarget: user.weeklyTarget,
      },
    });
  } catch (err) {
    console.error('GOOGLE LOGIN ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateMe, googleLogin };
