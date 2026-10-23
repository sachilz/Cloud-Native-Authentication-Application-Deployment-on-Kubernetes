const { checkDbConnection } = require('../config/db');

async function getHealth(req, res) {
  const dbHealth = await checkDbConnection();
  res.status(200).json({
    status: 'OK',
    service: 'devops-task-tracker-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealth.connected ? 'connected' : 'disconnected',
  });
}

function getLiveness(req, res) {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
}

async function getReadiness(req, res) {
  const dbHealth = await checkDbConnection();
  if (dbHealth.connected) {
    return res.status(200).json({
      status: 'READY',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: 'NOT_READY',
    database: 'disconnected',
    error: dbHealth.error,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
  getLiveness,
  getReadiness,
};
