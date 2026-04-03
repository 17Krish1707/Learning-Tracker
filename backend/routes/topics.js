const express = require('express');
const router = express.Router();
const { getTopics, createTopic, updateTopic, deleteTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/topics/:subjectId?page=1&limit=20&status=&priority=&search=&sortBy=createdAt&order=desc
router.get('/:subjectId', getTopics);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

module.exports = router;