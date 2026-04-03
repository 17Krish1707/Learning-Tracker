const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [100, 'Folder name cannot exceed 100 characters'],
    },
    emoji: { type: String, default: '📁' },
    color: { type: String, default: '#7c6ff7' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Folder', folderSchema);