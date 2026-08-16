const db = require('../../models');
const simpleQueue = require('../queue/simpleQueue');
const eventBus = require('../events/event-bus');

class JobService {
  /**
   * Step 1: Accept Job
   * Persist the job to MySQL as ACCEPTED
   */
  async acceptJob(jobData) {
    try {
      const job = await db.Job.create({
        type: jobData.type,
        queueName: jobData.queueName,
        payload: JSON.stringify(jobData.payload),
        status: 'ACCEPTED'
      });
      
      eventBus.publish('JOB_ACCEPTED', { jobId: job.id, type: job.type });
      return job;
    } catch (error) {
      console.error('❌ JobService Accept Error:', error);
      throw error;
    }
  }

  /**
   * Step 2: Queue Job
   * Move job from ACCEPTED to QUEUED and push to SimpleQueue
   */
  async queueJob(jobId) {
    try {
      const job = await db.Job.findByPk(jobId);
      if (!job || job.status !== 'ACCEPTED') {
        throw new Error(`Job ${jobId} not found or not in ACCEPTED state`);
      }

      // Persist to our simple queue logic
      await simpleQueue.enqueue(job.queueName, {
        jobId: job.id,
        payload: JSON.parse(job.payload)
      });

      // Update state to QUEUED
      await job.update({ status: 'QUEUED' });
      
      eventBus.publish('JOB_QUEUED', { jobId: job.id, queue: job.queueName });
      return job;
    } catch (error) {
      console.error('❌ JobService Queue Error:', error);
      throw error;
    }
  }

  async getJobStatus(jobId) {
    return await db.Job.findByPk(jobId);
  }

  async updateJobStatus(jobId, status, error = null) {
    const job = await db.Job.findByPk(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    let updatedStatus = status;
    let updatedError = error;

    if (status === 'FAILED') {
      if (job.attemptCount < job.maxAttempts) {
        updatedStatus = 'RETRYING';
        const backoff = Math.pow(2, job.attemptCount) * 1000;
        console.log(`🔄 Job ${jobId} failed, but attempt ${job.attemptCount + 1}/${job.maxAttempts} allows retry. Retrying in ${backoff}ms...`);
        
        // Schedule re-queueing
        setTimeout(async () => {
          try {
            await this.queueJob(jobId);
          } catch (e) {
            console.error(`❌ Failed to re-queue job ${jobId} after backoff:`, e.message);
          }
        }, backoff);
      } else {
        updatedStatus = 'FAILED';
        console.log(`🚫 Job ${jobId} failed after ${job.attemptCount} attempts.`);
      }
    }

    return await db.Job.update(
      { 
        status: updatedStatus, 
        lastError: updatedError,
        attemptCount: status === 'PROCESSING' ? job.attemptCount + 1 : job.attemptCount
      },
      { where: { id: jobId } }
    ).then(async () => {
      eventBus.publish(`JOB_${updatedStatus}`, { 
        jobId, 
        status: updatedStatus, 
        error: updatedError 
      });
      return updatedStatus;
    });
  }
  async getMetrics() {
    try {
      const statuses = ['ACCEPTED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING'];
      const metrics = {};

      for (const status of statuses) {
        const count = await db.Job.count({ where: { status } });
        metrics[status.toLowerCase()] = count;
      }

      // Special aggregate for 'Pending' (ACCEPTED + QUEUED)
      metrics.pending = metrics.accepted + metrics.queued;

      return metrics;
    } catch (error) {
      console.error('❌ JobService getMetrics Error:', error);
      throw error;
    }
  }}

module.exports = new JobService();
