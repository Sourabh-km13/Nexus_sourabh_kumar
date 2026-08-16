const express = require('express');
const cors = require('cors');
const jobRoutes = require('./routes/jobs.routes');
const workerRoutes = require('./routes/workers.routes');
const eventRoutes = require('./routes/events.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

module.exports = app;
