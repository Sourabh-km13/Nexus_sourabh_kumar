const db = require('../models');

async function simulateJobs() {
  try {
    console.log('🧪 Simulating job status redistribution...');
    
    const jobs = await db.Job.findAll();
    if (jobs.length === 0) {
      console.log('⚠️ No jobs found to simulate. Please create some jobs first.');
      return;
    }

    const total = jobs.length;
    const completedCount = Math.floor(total * 0.5); // 50% Completed
    const failedCount = Math.floor(total * 0.3);    // 30% Failed

    console.log(`Updating ${completedCount} to COMPLETED, ${failedCount} to FAILED...`);

    for (let i = 0; i < total; i++) {
      let newStatus = 'ACCEPTED';
      if (i < completedCount) {
        newStatus = 'COMPLETED';
      } else if (i < completedCount + failedCount) {
        newStatus = 'FAILED';
      } else {
        newStatus = 'QUEUED';
      }
      
      await jobs[i].update({ status: newStatus });
    }

    console.log('✅ Simulation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Simulation Error:', error);
    process.exit(1);
  }
}

simulateJobs();