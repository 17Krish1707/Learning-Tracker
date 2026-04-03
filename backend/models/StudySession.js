const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // in hours
      required: [true, 'Duration is required'],
      min: [0.01, 'Duration must be at least 0.01 hours'],
      max: [24, 'Duration cannot exceed 24 hours'],
    },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudySession', studySessionSchema);