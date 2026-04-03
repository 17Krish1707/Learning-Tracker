const express = require('express');
const router = express.Router();
const { getStats, getSubjectStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getStats);
router.get('/subjects', getSubjectStats);

module.exports = router;