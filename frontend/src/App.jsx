import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, Activity, Terminal } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Workers from './pages/Workers';
import LiveLogs from './pages/LiveLogs';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <Activity size={24} />
            <span>NEXUS</span>
          </div>
          <nav>
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={20} />
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Briefcase size={20} />
                  Job Management
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/workers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Users size={20} />
                  Worker Control
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Terminal size={20} />
                  Live Logs
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/logs" element={<LiveLogs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
