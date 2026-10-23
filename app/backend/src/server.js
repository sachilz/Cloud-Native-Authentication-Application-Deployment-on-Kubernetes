const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { closeDb } = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] DevOps Task Tracker Backend running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
function shutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await closeDb();
      console.log('[Server] Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error while closing database pool:', err);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
