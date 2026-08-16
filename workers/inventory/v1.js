const simpleQueue = require('../../server/queue/simpleQueue');
const db = require('../../models');
const jobService = require('../../server/services/job.service');
const eventService = require('../../server/services/event.service');

// Heartbeat mechanism
setInterval(() => {
  if (process.send) {
    process.send({
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      workerId: process.env.WORKER_ID
    });
  }
}, 2000);

async function runWorker() {
  console.log('👷 Inventory Worker v1 started...');
  
  while (true) {
    try {
      // Dequeue a job from the "inventory" queue
      const message = await simpleQueue.dequeue('inventory');
      
      if (!message) {
        // No work available, wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const { id, payload: queuePayload } = message;
      const { jobId, payload: businessData } = queuePayload;
      console.log(`⚙️ Processing Job ${jobId}...`);

      // 1. IDEMPOTENCY CHECK
      const job = await db.Job.findByPk(jobId);
      if (!job || job.status === 'COMPLETED') {
        console.log(`♻️ Duplicate detected for Job ${jobId}. Skipping side effects.`);
        await eventService.logEvent('DUPLICATE_DELIVERY', 'Job', jobId, 'Job already completed');
        await simpleQueue.complete(id);
        continue;
      }

      // Mark as PROCESSING
      await jobService.updateJobStatus(jobId, 'PROCESSING');

      // Simulate a realistic processing time (1-3 seconds)
      const processingTime = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // 2. DETERMINISTIC LOGIC & FAILURE MODES
      if (businessData.failureMode === 'crash') {
        console.log(`💥 Simulated Crash for Job ${jobId}...`);
        process.exit(1);
      }

      if (businessData.failureMode === 'slow') {
        console.log(`⏳ Simulated Slow Processing for Job ${jobId}...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      if (!businessData.productId || !businessData.quantity) {
        throw new Error('Invalid payload: productId and quantity are required');
      }

      // Real deterministic calculation: Sum of digits of productId + quantity
      const sumDigits = (num) => String(num).split('').reduce((a, b) => a + parseInt(b), 0);
      const resultValue = sumDigits(businessData.productId) + businessData.quantity;
      const result = `Calculation Result: ${resultValue}`;
      console.log(`✅ Result: ${result}`);

      // 3. FINALIZATION
      await jobService.updateJobStatus(jobId, 'COMPLETED');
      await simpleQueue.complete(id);
      
      console.log(`🎉 Job ${jobId} completed successfully`);

    } catch (error) {
      console.error('❌ Worker Error:', error.message);
      
      // Recover jobId from the message if possible to mark it as FAILED
      try {
        if (typeof message !== 'undefined' && message.payload && message.payload.jobId) {
          await jobService.updateJobStatus(message.payload.jobId, 'FAILED', error.message);
        }
      } catch (updateError) {
        console.error('❌ Failed to update job status to FAILED:', updateError.message);
      }
    }
  }
}

runWorker().catch(err => {
  console.error('💥 Worker Fatal Error:', err);
  process.exit(1);
});
