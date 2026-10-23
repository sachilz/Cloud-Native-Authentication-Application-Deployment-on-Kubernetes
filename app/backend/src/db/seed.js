const fs = require('fs');
const path = require('path');
const { query, closeDb } = require('../config/db');

async function runSeed() {
  console.log('[Seed] Seeding initial users...');
  try {
    const seedFile = path.join(__dirname, 'seeds', '001_seed_tasks.sql');
    const sql = fs.readFileSync(seedFile, 'utf8');

    await query(sql);
    console.log('[Seed] Demo user seeded successfully.');
  } catch (error) {
    console.error('[Seed] Failed to seed database:', error.message);
    throw error;
  }
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('[Seed] Seeding completed.');
      return closeDb();
    })
    .catch((err) => {
      console.error('[Seed] Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { runSeed };
