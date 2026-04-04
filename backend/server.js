const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');
const sessionRoutes = require('./routes/sessions');
const statsRoutes = require('./routes/stats');
const folderRoutes = require('./routes/folders');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mystudytrackr.vercel.app',
    'https://study-tracker-app-17krish1707s-projects.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());

// Connect DB once per cold start (Vercel reuses connections)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/folders', folderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Learning Tracker API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Export for Vercel
module.exports = app;

// Only run server locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}