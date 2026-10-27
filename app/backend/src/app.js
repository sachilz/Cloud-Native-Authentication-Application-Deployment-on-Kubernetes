const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware (disabled in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct root and health endpoints for Kubernetes probes
app.use('/health', healthRoutes);
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'DevOps Authentication Service',
    description: 'Cloud-Native User Authentication API on Minikube',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Main API status endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'DevOps Authentication Backend API',
    endpoints: {
      health: '/api/health',
      login: 'POST /api/login',
      register: 'POST /api/register',
    },
  });
});

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
// Direct aliases
app.use('/api', authRoutes);

// Fallback 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
