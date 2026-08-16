import React from 'react';
import { api } from '../services/api';

export const StatCard = ({ label, value, colorClass }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className={`stat-value ${colorClass}`}>{value}</div>
  </div>
);

export const EventItem = ({ event }) => (
  <div className="log-entry">
    <span className="log-timestamp">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
    <span className="log-message">
      <strong>{event.type}</strong>: {event.message}
    </span>
  </div>
);
