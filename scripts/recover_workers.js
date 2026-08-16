const db = require('../models');

async function recoverWorkers() {
  try {
    console.log('--- NEXUS WORKER RECOVERY ---');
    
    // Find all workers that are OUT_OF_SERVICE or STOPPED
    const workersToRecover = await db.Worker.findAll({
      where: {
        status: ['OUT_OF_SERVICE', 'STOPPED']
      }
    });

    if (workersToRecover.length === 0) {
      console.log('No workers found needing recovery.');
      process.exit(0);
    }

    console.log(`Recovering ${workersToRecover.length} worker(s)...`);

    for (const worker of workersToRecover) {
      await worker.update({
        status: 'RUNNING',
        restartCount: 0,
        lastError: null
      });
      console.log(`✅ Worker ${worker.id} (${worker.name}) reset to RUNNING.`);
    }

    console.log('\n--- RECOVERY COMPLETE ---');
    console.log('Please restart your NEXUS server to trigger the Supervisor to spawn the processes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Recovery Error:', error);
    process.exit(1);
  }
}

recoverWorkers();
