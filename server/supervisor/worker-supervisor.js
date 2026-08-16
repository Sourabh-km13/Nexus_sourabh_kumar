const db = require('../../models');
const WorkerProcess = require('./worker-process');
const restartPolicy = require('./restart-policy');
const eventService = require('../services/event.service');

class WorkerSupervisor {
  constructor() {
    this.workers = new Map(); // workerId -> WorkerProcess
    this.workerConfigs = {
      'inventory-worker': {
        id: 'inventory-worker',
        name: 'Inventory Worker',
        queue: 'inventory',
        version: 'v1',
        script: 'workers/inventory/v1.js'
      },
      'notifications-worker': {
        id: 'notifications-worker',
        name: 'Notifications Worker',
        queue: 'notifications',
        version: 'v1',
        script: 'workers/inventory/v1.js'
      }
    };
  }

  async init() {
    console.log('🛠️ Initializing Worker Supervisor...');
    
    for (const config of Object.values(this.workerConfigs)) {
      // Ensure worker exists in DB
      await db.Worker.findOrCreate({
        where: { id: config.id },
        defaults: {
          name: config.name,
          queueName: config.queue,
          version: config.version,
          status: 'STOPPED'
        }
      });

      await this.spawnWorker(config.id);
    }
  }

  async spawnWorker(workerId) {
    const config = this.workerConfigs[workerId];
    const workerData = await db.Worker.findByPk(workerId);

    const wp = new WorkerProcess(config, this);
    this.workers.set(workerId, wp);
    
    await wp.start();
    
    // Transition to RUNNING after a short delay or first heartbeat
    setTimeout(async () => {
      await db.Worker.update({ status: 'RUNNING' }, { where: { id: workerId } });
    }, 1000);
  }

  async handleHeartbeat(workerId, msg) {
    await db.Worker.update(
      { 
        lastHeartbeat: new Date(),
        status: 'RUNNING'
      }, 
      { where: { id: workerId } }
    );
  }

  async handleExit(workerId, code, signal) {
    const worker = await db.Worker.findByPk(workerId);
    const restartCount = worker.restartCount + 1;

    await db.Worker.update(
      { 
        status: 'RESTARTING', 
        restartCount: restartCount, 
        lastError: `Exited with code ${code}, signal ${signal}` 
      }, 
      { where: { id: workerId } }
    );

    // Record the attempt
    await db.WorkerAttempt.create({
      workerId: workerId,
      attemptNumber: restartCount,
      startedAt: new Date(), // Simplified for now
      endedAt: new Date(),
      exitCode: code,
      signal: signal
    });

    await eventService.logEvent('WORKER_CRASHED', 'Worker', workerId, `Process exited (Code: ${code})`);

    if (restartPolicy.shouldAllowRestart(restartCount)) {
      const delay = restartPolicy.getBackoff(restartCount);
      console.log(`🔄 Restarting ${workerId} in ${delay}ms...`);
      setTimeout(() => this.spawnWorker(workerId), delay);
    } else {
      console.error(`🚫 Restart budget exhausted for ${workerId}. Marking OUT_OF_SERVICE.`);
      await db.Worker.update({ status: 'OUT_OF_SERVICE' }, { where: { id: workerId } });
      await eventService.logEvent('WORKER_OUT_OF_SERVICE', 'Worker', workerId, 'Restart budget exhausted');
    }
  }
}

module.exports = new WorkerSupervisor();
