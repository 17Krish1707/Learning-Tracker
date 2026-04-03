const express = require('express');
const router = express.Router();
const { createSession, getSessionsByTopic, deleteSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createSession);
router.get('/:topicId', getSessionsByTopic);
router.delete('/:id', deleteSession);

module.exports = router;