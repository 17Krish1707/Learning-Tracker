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
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow localhost and any *.vercel.app URL
    if (
      origin.startsWith('http://localhost') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
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

// Routes mounting utility
const mount = (routePath, router) => {
  app.use(routePath, router);
  // Also mount without /api prefix for Vercel environment compatibility
  if (routePath.startsWith('/api/')) {
    app.use(routePath.replace('/api', ''), router);
  }
};

mount('/api/auth', authRoutes);
mount('/api/subjects', subjectRoutes);
mount('/api/topics', topicRoutes);
mount('/api/sessions', sessionRoutes);
mount('/api/stats', statsRoutes);
mount('/api/folders', folderRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', message: 'Learning Tracker API is running' });
});

// Custom 404 handler for debugging routing issues
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
    hint: "If you see this, the rewrite to api/index.js worked, but the Express router didn't find a match."
  });
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