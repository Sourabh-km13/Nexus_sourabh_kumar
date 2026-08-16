const express = require('express');
const router = express.Router();
const sseManager = require('../events/sse-manager');

// GET /api/events/stream - SSE Connection endpoint
router.get('/stream', (req, res) => {
  sseManager.registerClient(res);
});

module.exports = router;
