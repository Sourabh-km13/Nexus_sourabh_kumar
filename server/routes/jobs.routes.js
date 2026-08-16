const express = require('express');
const router = express.Router();
const jobService = require('../services/job.service');
const db = require('../../models');

// GET /api/jobs - List all jobs for the management table
router.get('/', async (req, res) => {
  try {
    const jobs = await db.Job.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(jobs);
  } catch (error) {
    console.error('❌ Get All Jobs Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/jobs - Accept a new job
router.post('/', async (req, res) => {
  try {
    const { type, queueName, payload } = req.body;

    if (!type || !queueName || !payload) {
      return res.status(400).json({ error: 'Missing required fields: type, queueName, payload' });
    }

    const job = await jobService.acceptJob({ type, queueName, payload });
    
    res.status(202).json({
      accepted: true,
      jobId: job.id,
      status: job.status
    });
  } catch (error) {
    console.error('❌ API Job Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/jobs/:id - Get job status
router.get('/:id', async (req, res) => {
  try {
    const job = await jobService.getJobStatus(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
