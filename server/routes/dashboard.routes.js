const express = require('express');
const router = express.Router();
const jobService = require('../services/job.service');
const db = require('../../models');

// GET /api/dashboard - Get summary of system state
router.get('/', async (req, res) => {
  try {
    const workers = await db.Worker.findAll();
    const jobMetrics = await jobService.getMetrics();
    
    // Flatten grouped metrics for the frontend if it expects a total, 
    // but we'll keep the grouped structure to allow queue-specific sections in UI.
    const totalStats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    Object.values(jobMetrics).forEach(qStats => {
      totalStats.pending += (qStats.pending || 0);
      totalStats.processing += (qStats.processing || 0);
      totalStats.completed += (qStats.completed || 0);
      totalStats.failed += (qStats.failed || 0);
    });

    const events = await db.Event.findAll({
      limit: 100,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      workers,
      jobStats: jobMetrics, // This now contains { inventory: {...}, notifications: {...} }
      totals: totalStats,
      recentEvents: events
    });
  } catch (error) {
    console.error('❌ Dashboard API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
