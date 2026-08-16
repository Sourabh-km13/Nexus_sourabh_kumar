import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard, EventItem } from '../components/DashboardComponents';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await api.getDashboard();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const es = api.getEventStream();
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // If any job or worker update occurs, refresh the dashboard metrics
      if (data.eventName && (data.eventName.startsWith('JOB_') || data.eventName.startsWith('WORKER_'))) {
        fetchDashboardData();
      }
    };

    return () => es.close();
  }, []);

  if (loading && !data) return <div className="main-content">Loading system overview...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">System Overview</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Workers" value={data?.workers?.length || 0} />
        <StatCard label="Pending Jobs" value={data?.jobStats?.pending || 0} colorClass="badge-warning" />
        <StatCard label="Processing" value={data?.jobStats?.processing || 0} colorClass="badge-info" />
        <StatCard label="Completed" value={data?.jobStats?.completed || 0} colorClass="badge-success" />
        <StatCard label="Failed" value={data?.jobStats?.failed || 0} colorClass="badge-error" />
      </div>

      <div className="card">
        <div className="card-header">Recent System Events</div>
        <div className="card-body">
          <div className="log-container">
            {data?.recentEvents?.length > 0 ? (
              data.recentEvents.map((event, idx) => (
                <EventItem key={idx} event={event} />
              ))
            ) : (
              <div className="log-entry">No recent events found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
