const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool;

function getPool() {
  if (!pool) {
    const connectionConfig = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'devops_tasks',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        };

    pool = new Pool({
      ...connectionConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

// Custom query helper using pool
async function query(text, params) {
  const p = getPool();
  const start = Date.now();
  const res = await p.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}

// Health check connectivity helper
async function checkDbConnection() {
  try {
    const result = await query('SELECT 1 AS connected');
    return {
      connected: result.rows.length > 0 && result.rows[0].connected === 1,
      error: null,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
}

// Graceful shutdown helper
async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Function to allow injecting a mock pool for unit tests
function setPool(mockPool) {
  pool = mockPool;
}

module.exports = {
  getPool,
  query,
  checkDbConnection,
  closeDb,
  setPool,
};
