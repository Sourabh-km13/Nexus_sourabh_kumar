import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { EventItem } from '../components/DashboardComponents';
import { Terminal, Trash2, Play, Pause } from 'lucide-react';

export default function LiveLogs() {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const eventSourceRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    connectSSE();
    return () => disconnectSSE();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const connectSSE = () => {
    try {
      const es = api.getEventStream();
      eventSourceRef.current = es;
      
      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        if (isPaused) return;
        const data = JSON.parse(event.data);
        setLogs((prev) => [...prev, data].slice(-100)); // Keep last 100 logs
      };

      es.onerror = (err) => {
        console.error("SSE Error:", err);
        setIsConnected(false);
        disconnectSSE();
        // Retry connection after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    } catch (e) {
      console.error("Failed to connect to SSE", e);
    }
  };

  const disconnectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={18} />
          Live System Stream
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={clearLogs}
            title="Clear Logs"
          >
            <Trash2 size={14} />
            Clear
          </button>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: isConnected ? 'var(--success)' : 'var(--error)',
            marginLeft: '0.5rem'
          }} title={isConnected ? "Connected" : "Disconnected"} />
        </div>
      </div>
      <div className="card-body">
        <div className="log-container" style={{ minHeight: '300px', maxHeight: '500px' }}>
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <EventItem key={idx} event={log} />
            ))
          ) : (
            <div className="log-entry" style={{ color: '#64748b', fontStyle: 'italic' }}>
              Waiting for events...
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
