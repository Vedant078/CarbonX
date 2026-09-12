import { initDatabase } from '../lib/init-db';

async function main() {
  console.log('[Migration] Starting PostgreSQL schema migration and database initialization...');
  const success = await initDatabase();
  if (success) {
    console.log('[Migration] Migration completed successfully.');
    process.exit(0);
  } else {
    console.error('[Migration] Migration failed.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[Migration Exception]:', err);
  process.exit(1);
});
