const Folder = require('../models/Folder');
const Subject = require('../models/Subject');

// @route GET /api/folders
const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, folders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/folders
const createFolder = async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });

    const folder = await Folder.create({ userId: req.user._id, name, emoji, color });
    res.status(201).json({ success: true, folder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/folders/:id
const updateFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });

    const { name, emoji, color } = req.body;
    if (name) folder.name = name;
    if (emoji) folder.emoji = emoji;
    if (color) folder.color = color;
    await folder.save();

    res.json({ success: true, folder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/folders/:id
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found.' });

    // Move all subjects in this folder to uncategorized
    await Subject.updateMany({ folderId: folder._id }, { folderId: null });
    await folder.deleteOne();

    res.json({ success: true, message: 'Folder deleted. Subjects moved to uncategorized.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFolders, createFolder, updateFolder, deleteFolder };