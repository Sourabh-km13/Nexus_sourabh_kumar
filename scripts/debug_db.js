const db = require('../models');

async function debugDB() {
  try {
    console.log('--- NEXUS DATABASE DIAGNOSTIC ---');
    
    // 1. Check Job Statuses
    const jobCounts = await db.Job.findAll({
      attributes: [
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
        'status'
      ],
      group: ['status']
    });
    
    console.log('\nJobs by Status:');
    if (jobCounts.length === 0) {
      console.log('No jobs found in database.');
    } else {
      jobCounts.forEach(row => {
        console.log(`${row.getDataValue('status')}: ${row.getDataValue('count')}`);
      });
    }

    // 2. Check Worker Statuses
    const workerCounts = await db.Worker.findAll({
      attributes: [
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
        'status'
      ],
      group: ['status']
    });

    console.log('\nWorkers by Status:');
    if (workerCounts.length === 0) {
      console.log('No workers found in database.');
    } else {
      workerCounts.forEach(row => {
        console.log(`${row.getDataValue('status')}: ${row.getDataValue('count')}`);
      });
    }

    // 3. Check if there are any jobs in ACCEPTED state (stuck)
    const stuckJobs = await db.Job.count({ where: { status: 'ACCEPTED' } });
    console.log(`\nJobs stuck in ACCEPTED: ${stuckJobs}`);

    console.log('\n--- DIAGNOSTIC COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnostic Error:', error);
    process.exit(1);
  }
}

debugDB();
