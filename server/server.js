const app = require('./app');
const config = require('./config/env');
const { sequelize, syncDb } = require('./db/sequelize');
const simpleQueue = require('./queue/simpleQueue');
const dispatcher = require('./queue/dispatcher');
const workerSupervisor = require('./supervisor/worker-supervisor');
const healthMonitor = require('./monitoring/health-monitor');
const sseManager = require('./events/sse-manager');

async function startServer() {
  try {
    // Sync Database - ensures table existence and handles clean starts
    await syncDb();
    
    await sequelize.authenticate();
    console.log('✅ MySQL Connected');

    // Initialize SSE Manager
    sseManager.init();

    // Start Worker Supervisor (spawns workers)
    await workerSupervisor.init();

    // Start Health Monitor
    healthMonitor.start();

    // Start the job dispatcher loop
    dispatcher.start();

    app.listen(config.PORT, () => {
      console.log(`🚀 NEXUS Control Plane running on http://localhost:${config.PORT}`);
      console.log(`🩺 Health check: http://localhost:${config.PORT}/health`);
    });
  } catch (error) {
    console.error('💥 Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
