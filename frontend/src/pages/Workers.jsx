import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      const data = await api.getDashboard();
      setWorkers(data.workers || []);
    } catch (err) {
      console.error("Failed to fetch workers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (workerId, action) => {
    try {
      if (action === 'crash') await api.triggerWorkerFailure(workerId);
      if (action === 'restart') await api.triggerWorkerRestart(workerId);
      fetchWorkers();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  if (loading) return <div className="main-content">Loading worker list...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Worker Control Panel</h1>
      </div>

      <div className="card">
        <div className="card-header">Active Worker Nodes</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Status</th>
                <th>Last Heartbeat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.length > 0 ? workers.map(worker => (
                <tr key={worker.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} /> {worker.id}
                  </td>
                  <td>
                    <span className={`badge ${worker.status === 'healthy' ? 'badge-success' : 'badge-error'}`}>
                      {worker.status}
                    </span>
                  </td>
                  <td>{new Date(worker.lastHeartbeat).toLocaleTimeString()}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleAction(worker.id, 'restart')}
                      title="Restart Worker"
                    >
                      <RefreshCw size={14} /> Restart
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleAction(worker.id, 'crash')}
                      title="Simulate Crash"
                    >
                      <AlertTriangle size={14} /> Crash
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No workers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
