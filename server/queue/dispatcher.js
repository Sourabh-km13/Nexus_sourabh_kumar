const db = require('../../models');
const jobService = require('../services/job.service');
const eventBus = require('../events/event-bus');

class Dispatcher {
  constructor() {
    this.interval = null;
    this.isPolling = false;
  }

  /**
   * Starts the dispatcher polling loop
   * Looks for ACCEPTED jobs and moves them to QUEUED
   */
  start() {
    if (this.isPolling) return;
    
    console.log('🚀 Dispatcher started: Polling for ACCEPTED jobs...');
    this.isPolling = true;
    this.interval = setInterval(() => {
      this.dispatch();
      this.recoverZombies();
    }, 5000);
  }

  stop() {
    clearInterval(this.interval);
    this.isPolling = false;
    console.log('🛑 Dispatcher stopped.');
  }

  async dispatch() {
    try {
      // Find jobs that are still in ACCEPTED state
      const acceptedJobs = await db.Job.findAll({
        where: { status: 'ACCEPTED' },
        limit: 10
      });

      if (acceptedJobs.length === 0) return;

      console.log(`📦 Dispatching ${acceptedJobs.length} jobs...`);

      for (const job of acceptedJobs) {
        try {
          await jobService.queueJob(job.id);
          console.log(`✅ Job ${job.id} queued successfully`);
          eventBus.publish('JOB_DISPATCHED', { jobId: job.id });
        } catch (err) {
          console.error(`❌ Failed to queue job ${job.id}:`, err.message);
        }
      }
    } catch (error) {
      console.error('❌ Dispatcher Loop Error:', error);
    }
  }

  /**
   * Recovers jobs stuck in PROCESSING state for too long
   * Moves them back to ACCEPTED so they can be re-dispatched
   */
  async recoverZombies() {
    try {
      const timeoutLimit = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      
      const zombieJobs = await db.Job.findAll({
        where: {
          status: 'PROCESSING',
          updatedAt: { [db.Op.lt]: timeoutLimit }
        }
      });

      if (zombieJobs.length === 0) return;

      console.log(`🧟 Recovering ${zombieJobs.length} zombie jobs...`);
      
      for (const job of zombieJobs) {
        await job.update({ status: 'ACCEPTED' });
        console.log(`♻️ Job ${job.id} recovered to ACCEPTED`);
      }
    } catch (error) {
      console.error('❌ Zombie Recovery Error:', error);
    }
  }
}

module.exports = new Dispatcher();
