const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    color: { type: String, default: '#7c6ff7' },
    iconName: { type: String, default: 'Book' },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index: one user can't have duplicate subject names
subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);