const db = require('../../models');
const eventService = require('../services/event.service');

class HealthMonitor {
  constructor() {
    this.interval = null;
    this.heartbeatThreshold = 5000; // 5 seconds
  }

  start() {
    console.log('🩺 Health Monitor started: Monitoring heartbeats...');
    this.interval = setInterval(() => this.checkHealth(), 5000);
  }

  stop() {
    clearInterval(this.interval);
  }

  async checkHealth() {
    try {
      const workers = await db.Worker.findAll({
        where: { status: ['RUNNING', 'STARTING'] }
      });

      const now = new Date();

      for (const worker of workers) {
        if (!worker.lastHeartbeat) continue;

        const diff = now - worker.lastHeartbeat;
        if (diff > this.heartbeatThreshold) {
          console.log(`⚠️ Worker ${worker.id} heartbeat stale (${diff}ms). Marking DEGRADED.`);
          await worker.update({ status: 'DEGRADED' });
          await eventService.logEvent('WORKER_HEARTBEAT_LOST', 'Worker', worker.id, `Heartbeat stale for ${diff}ms`);
        }
      }
    } catch (error) {
      console.error('❌ HealthMonitor Error:', error);
    }
  }
}

module.exports = new HealthMonitor();
