import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://vedant:290624@localhost:5432/carbonx';

const globalForPg = global as unknown as { pgPool: Pool; isDbInitialized?: boolean };

export const pool = globalForPg.pgPool || new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

export class DbConnectionError extends Error {
  code = 'DB_CONNECTION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'DbConnectionError';
  }
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  let client;
  try {
    client = await pool.connect();
  } catch (err: any) {
    console.error('PostgreSQL connection attempt failed:', err?.message || err);
    throw new DbConnectionError('Unable to connect to PostgreSQL database.');
  }

  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  let client;
  try {
    client = await pool.connect();
  } catch (err: any) {
    console.error('PostgreSQL connection attempt failed during transaction:', err?.message || err);
    throw new DbConnectionError('Unable to connect to PostgreSQL database.');
  }

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('PostgreSQL rollback error:', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}
