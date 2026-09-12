import { NextResponse } from 'next/server';
import { pool } from '@/lib/postgres';

export async function GET() {
  const isDbUrlConfigured = !!process.env.DATABASE_URL;
  let isDbReachable = false;
  let tables: string[] = [];
  let dbError: string | null = null;

  try {
    const client = await pool.connect();
    try {
      isDbReachable = true;
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tables = res.rows.map((r: any) => r.table_name);
    } finally {
      client.release();
    }
  } catch (err: any) {
    isDbReachable = false;
    dbError = err?.message || 'Database unreachable';
  }

  const expectedTables = ['users', 'profiles', 'sessions', 'bidding_opportunities', 'app_notifications'];
  const missingTables = expectedTables.filter((t) => !tables.includes(t));
  const isSchemaReady = isDbReachable && missingTables.length === 0;

  return NextResponse.json({
    status: isDbReachable ? 'HEALTHY' : 'DEGRADED_FALLBACK_ACTIVE',
    environment: process.env.NODE_ENV || 'development',
    database: {
      urlConfigured: isDbUrlConfigured,
      reachable: isDbReachable,
      schemaReady: isSchemaReady,
      tablesFound: tables.length,
      missingTables,
      error: dbError,
    },
    timestamp: new Date().toISOString(),
  });
}
