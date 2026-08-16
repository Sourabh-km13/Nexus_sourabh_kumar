const axios = require('axios');
const db = require('../models');

async function testPipeline() {
  console.log('🧪 Starting End-to-End Pipeline Test...');
  
  try {
    // 1. Submit a job
    console.log('📤 Submitting job...');
    const response = await axios.post('http://localhost:3000/api/jobs', {
      type: 'inventory-update',
      queueName: 'inventory',
      payload: { productId: 99, quantity: 10 }
    });
    
    const jobId = response.data.jobId;
    console.log(`✅ Job submitted. ID: ${jobId}`);

    // 2. Poll for completion
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 20) {
      attempts++;
      console.log(`⏳ Polling status (Attempt ${attempts}/20)...`);
      
      const statusRes = await axios.get(`http://localhost:3000/api/jobs/${jobId}`);
      const status = statusRes.data.status;
      
      console.log(`Current Status: ${status}`);
      if (status === 'COMPLETED') {
        completed = true;
      } else if (status === 'FAILED') {
        throw new Error('Job failed in pipeline');
      }
      
      await new Promise(res => setTimeout(res, 2000));
    }

    if (!completed) throw new Error('Job timed out before completion');
    
    console.log('🎉 TEST PASSED: Job moved from ACCEPTED -> QUEUED -> COMPLETED');
    process.exit(0);

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

testPipeline();
