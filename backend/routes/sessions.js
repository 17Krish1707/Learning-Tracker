const express = require('express');
const router  = express.Router();
const { createSession, getSessionsByTopic, getAllSessions, deleteSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET  /api/sessions          → all sessions for the logged-in user (History view)
// GET  /api/sessions/:topicId → sessions for a specific topic
// POST /api/sessions          → log a new session
// DELETE /api/sessions/:id   → delete a session

router.get('/',           getAllSessions);
router.get('/:topicId',   getSessionsByTopic);
router.post('/',          createSession);
router.delete('/:id',     deleteSession);

module.exports = router;