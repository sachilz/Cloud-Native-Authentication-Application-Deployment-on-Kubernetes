const fs = require('fs');
const path = require('path');
const { query, closeDb } = require('../config/db');

async function runMigrations() {
  console.log('[Migration] Starting database migration...');
  const migrationFile = path.join(__dirname, 'migrations', '001_init.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    await query(sql);
    console.log('[Migration] Migration 001_init.sql applied successfully.');
  } catch (error) {
    console.error('[Migration] Failed to run migration:', error.message);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('[Migration] All migrations completed successfully.');
      return closeDb();
    })
    .catch((err) => {
      console.error('[Migration] Migration error:', err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
