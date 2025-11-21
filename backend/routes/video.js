const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware'); // Use your auth middleware

// POST /api/video/token - Get video token
router.post('/token', protect, videoController.getVideoToken);

module.exports = router;
