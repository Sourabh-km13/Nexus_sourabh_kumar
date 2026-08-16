const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const QUEUES = ['inventory', 'notification'];
const JOB_TYPES = {
  inventory: ['inventory-update', 'stock-check', 'warehouse-sync'],
  notification: ['email-send', 'sms-alert', 'push-notify']
};

async function produceJob() {
  const queue = QUEUES[Math.floor(Math.random() * QUEUES.length)];
  const type = JOB_TYPES[queue][Math.floor(Math.random() * JOB_TYPES[queue].length)];
  
  // Randomly decide if this job should be "problematic" for testing failure modes
  const rand = Math.random();
  let failureMode = 'normal';
  if (rand < 0.1) failureMode = 'crash';
  else if (rand < 0.2) failureMode = 'slow';

  let payload = {
    timestamp: new Date().toISOString(),
    failureMode: failureMode
  };

  // Ensure the payload contains the specific fields required by the target worker
  if (queue === 'inventory') {
    payload.productId = Math.floor(Math.random() * 1000);
    payload.quantity = Math.floor(Math.random() * 100);
  } else if (queue === 'notification') {
    payload.userId = Math.floor(Math.random() * 5000);
    payload.message = 'System Notification';
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/jobs`, {
      type,
      queueName: queue,
      payload
    });
    console.log(`✅ Produced ${type} job to ${queue} queue. ID: ${response.data.jobId} [Mode: ${failureMode}]`);
  } catch (error) {
    console.error(`❌ Failed to produce job: ${error.message}`);
  }
}

async function start() {
  console.log('🚀 NEXUS Automated Producer started...');
  console.log('Generating random jobs periodically to simulate system load...');
  
  // Produce a job every 3-7 seconds
  while (true) {
    await produceJob();
    const delay = Math.floor(Math.random() * 4000) + 3000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

start().catch(console.error);
