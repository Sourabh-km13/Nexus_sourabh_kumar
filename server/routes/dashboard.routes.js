const express = require('express');
const router = express.Router();
const jobService = require('../services/job.service');
const db = require('../../models');

// GET /api/dashboard - Get summary of system state
router.get('/', async (req, res) => {
  try {
    const workers = await db.Worker.findAll();
    const jobMetrics = await jobService.getMetrics();
    
    const events = await db.Event.findAll({
      limit: 100,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      workers,
      jobStats: jobMetrics,
      recentEvents: events
    });
  } catch (error) {
    console.error('❌ Dashboard API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
