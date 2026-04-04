const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// ... rest of your requires
const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');
const sessionRoutes = require('./routes/sessions');
const statsRoutes = require('./routes/stats');
const folderRoutes = require('./routes/folders');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile)
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ─── DB (lazy connect — safe for serverless cold-starts) ────────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ MongoDB connected');
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics',   topicRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats',    statsRoutes);
app.use('/api/folders',  folderRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', message: 'Learning Tracker API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;

// ─── Local dev server ──────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen(PORT, () =>
        console.log(`🚀 Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}