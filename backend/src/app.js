require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Route modules
const authSimpleRoutes = require('./routes/authSimple.routes');
const localRoutes = require('./routes/local.routes');

const app = express();

// Basic security & parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static dashboard for alerts
app.use(express.static(path.join(__dirname, 'public')));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'geoguard-api', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authSimpleRoutes);
app.use('/api/local', localRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'internal server error' });
});

module.exports = app;


