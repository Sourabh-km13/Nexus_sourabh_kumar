const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  async submitJob(jobData) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error('Failed to submit job');
    return response.json();
  },

  async getJobStatus(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    if (!response.ok) throw new Error(`Failed to fetch status for job ${jobId}`);
    return response.json();
  },

  async getAllJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  async triggerWorkerFailure(workerId) {
    const response = await fetch(`${API_BASE_URL}/workers/${workerId}/failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'crash' }),
    });
    if (!response.ok) throw new Error('Failed to trigger worker failure');
    return response.json();
  },

  async triggerWorkerRestart(workerId) {
    const response = await fetch(`${API_BASE_URL}/workers/${workerId}/restart`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to trigger worker restart');
    return response.json();
  },

  getEventStream() {
    return new EventSource(`${API_BASE_URL}/events/stream`);
  }
};
