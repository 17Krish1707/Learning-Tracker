const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    minutesSpent: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, default: null },
    notes: { type: String, default: '', maxlength: 50000 },
    resources: [{
      title: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, enum: ['PDF', 'Image', 'Link', 'Document'], default: 'Link' }
    }],
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-set completedAt when status becomes Completed
topicSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'Completed') {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model('Topic', topicSchema);