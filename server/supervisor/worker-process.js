const { fork } = require('child_process');
const path = require('path');
const db = require('../../models');
const eventService = require('../services/event.service');

class WorkerProcess {
  constructor(workerConfig, supervisor) {
    this.config = workerConfig;
    this.supervisor = supervisor;
    this.process = null;
    this.workerId = workerConfig.id;
  }

  async start() {
    console.log(`🚀 Spawning worker ${this.workerId} (version ${this.config.version})...`);
    
    // Using fork() for built-in IPC communication
    this.process = fork(path.resolve(this.config.script), [], {
      env: { 
        ...process.env,
        WORKER_ID: this.workerId,
        QUEUE_NAME: this.config.queue
      }
    });

    const pid = this.process.pid;
    
    // Initial state: STARTING
    await db.Worker.update(
      { status: 'STARTING', pid: pid },
      { where: { id: this.workerId } }
    );

    await eventService.logEvent('WORKER_STARTED', 'Worker', this.workerId, `Worker process spawned with PID ${pid}`);

    // Handle process messages (Heartbeats)
    this.process.on('message', (msg) => {
      if (msg.type === 'heartbeat') {
        this.supervisor.handleHeartbeat(this.workerId, msg);
      }
    });

    // Handle process exit
    this.process.on('exit', (code, signal) => {
      console.log(`⚠️ Worker ${this.workerId} exited with code ${code} and signal ${signal}`);
      this.supervisor.handleExit(this.workerId, code, signal);
    });

    this.process.on('error', (err) => {
      console.error(`❌ Worker ${this.workerId} process error:`, err);
      this.supervisor.handleExit(this.workerId, 1, 'ERROR');
    });
  }

  async stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

module.exports = WorkerProcess;
