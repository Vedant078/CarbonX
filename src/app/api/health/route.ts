import { NextResponse } from 'next/server';
import { query } from '@/lib/postgres';

export async function GET() {
  try {
    const result = await query('SELECT 1 as health');
    const isHealthy = result.length > 0 && result[0].health === 1;

    return NextResponse.json({
      status: 'ok',
      database: isHealthy ? 'connected' : 'unresponsive',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Health Check Database Error:', err.message);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: 'Database connection failed. Please ensure PostgreSQL is running on port 5432.',
      },
      { status: 500 }
    );
  }
}
