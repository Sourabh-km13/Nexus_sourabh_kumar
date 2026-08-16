const express = require('express');
const router = express.Router();
const db = require('../../models');
const workerSupervisor = require('../supervisor/worker-supervisor');

// POST /api/workers/:id/failure - Inject a failure
router.post('/:id/failure', async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.body;

    console.log(`⚠️ Injecting failure [${mode}] into worker ${id}...`);

    if (mode === 'crash') {
      const workerProcess = workerSupervisor.workers.get(id);
      if (workerProcess) {
        workerProcess.process.kill('SIGKILL');
        return res.json({ message: `Worker ${id} killed.` });
      }
    }

    res.status(400).json({ error: 'Invalid failure mode or worker not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workers/:id/restart - Manual restart
router.post('/:id/restart', async (req, res) => {
  try {
    const { id } = req.params;
    await workerSupervisor.spawnWorker(id);
    res.json({ message: `Worker ${id} restart triggered.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
