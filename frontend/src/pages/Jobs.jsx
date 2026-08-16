import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Send, Search, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

export default function Jobs() {
  const [jobForm, setJobForm] = useState({ type: 'inventory-update', queueName: 'inventory', payload: '{}' });
  const [allJobs, setAllJobs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllJobs = async () => {
    try {
      // Assuming we implement GET /api/jobs to list all
      const result = await api.getAllJobs();
      setAllJobs(result);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
    const es = api.getEventStream();
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.eventName && data.eventName.startsWith('JOB_')) {
        fetchAllJobs();
      }
    };
    return () => es.close();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = JSON.parse(jobForm.payload);
      await api.submitJob({ ...jobForm, payload });
      alert(`Job submitted successfully!`);
      fetchAllJobs();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return <span className="badge badge-success">Completed</span>;
      case 'FAILED': return <span className="badge badge-error">Failed</span>;
      case 'PROCESSING': return <span className="badge badge-info">Processing</span>;
      case 'QUEUED': return <span className="badge badge-warning">Queued</span>;
      default: return <span className="badge badge-outline">{status}</span>;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Job Management</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        <div className="card">
          <div className="card-header">Submit New Job</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <input 
                  className="form-input" 
                  value={jobForm.type} 
                  onChange={e => setJobForm({...jobForm, type: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Queue Name</label>
                <input 
                  className="form-input" 
                  value={jobForm.queueName} 
                  onChange={e => setJobForm({...jobForm, queueName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payload (JSON)</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '100px', fontFamily: 'monospace' }}
                  value={jobForm.payload} 
                  onChange={e => setJobForm({...jobForm, payload: e.target.value})}
                />
              </div>
              <button className="btn btn-primary" disabled={isSubmitting}>
                <Send size={16} />
                {isSubmitting ? 'Submitting...' : 'Submit Job'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Active Jobs Queue</div>
          <div className="card-body">
            {isLoading ? (
              <div>Loading jobs...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Error</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allJobs.map(job => (
                    <tr key={job.id}>
                      <td>{job.id}</td>
                      <td>{job.type}</td>
                      <td>{getStatusBadge(job.status)}</td>
                      <td className="text-error" style={{ fontSize: '12px' }}>{job.lastError || '-'}</td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => alert(`Payload: ${job.payload}`)}><Eye size={14} /></button></td>
                    </tr>
                  ))}
                  {allJobs.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No jobs found</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
