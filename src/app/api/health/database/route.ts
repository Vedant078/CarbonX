import { NextResponse } from 'next/server';
import { pool, checkDbHealth } from '@/lib/postgres';

export async function GET() {
  const isHealthy = await checkDbHealth();

  if (!isHealthy) {
    return NextResponse.json(
      {
        ok: false,
        database: 'unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
        message: 'Unable to connect to PostgreSQL database.',
      },
      { status: 503 }
    );
  }

  let tablesFound: string[] = [];
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tablesFound = res.rows.map((r: any) => r.table_name);
    } finally {
      client.release();
    }
  } catch {}

  const requiredTables = [
    'users',
    'profiles',
    'sessions',
    'carbon_sources',
    'bidding_opportunities',
    'bids',
    'buyer_requirements',
    'facilitated_deals',
    'logistics_shipments',
    'app_notifications',
    'audit_logs',
  ];

  const missingTables = requiredTables.filter((t) => !tablesFound.includes(t));
  const schemaReady = missingTables.length === 0;

  return NextResponse.json(
    {
      ok: true,
      database: 'connected',
      schemaReady,
      tablesCount: tablesFound.length,
      missingTables: missingTables.length > 0 ? missingTables : [],
    },
    { status: 200 }
  );
}
