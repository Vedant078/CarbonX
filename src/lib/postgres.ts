import { Pool } from 'pg';

// Avoid localhost IPv6 ::1 resolution issues on macOS by explicitly using 127.0.0.1
const rawConnectionString = process.env.DATABASE_URL || 'postgresql://vedant:290624@127.0.0.1:5432/carbonx';
const connectionString = rawConnectionString.replace('@localhost:', '@127.0.0.1:');

const isProduction = process.env.NODE_ENV === 'production';
const hasLocalhostInProd = isProduction && (
  (process.env.DATABASE_URL || '').includes('localhost') ||
  (process.env.DATABASE_URL || '').includes('127.0.0.1')
);

if (hasLocalhostInProd) {
  console.error('[PostgreSQL Config Error] Production environment detected localhost / 127.0.0.1 in DATABASE_URL. Render production requires the internal hosted PostgreSQL URL (e.g. postgresql://user:pass@dpg-xxx-a:5432/carbonx).');
}

const isRemoteDb = connectionString.includes('.render.com') ||
  connectionString.includes('.oregon-postgres.render.com') ||
  connectionString.includes('.frankfurt-postgres.render.com') ||
  connectionString.includes('.supabase.') ||
  connectionString.includes('.neon.') ||
  connectionString.includes('.railway.') ||
  connectionString.includes('sslmode=');

const sslConfig = isRemoteDb || isProduction
  ? { rejectUnauthorized: false }
  : false;

const globalForPg = global as unknown as { pgPool: Pool; isDbInitialized?: boolean };

export const pool = globalForPg.pgPool || new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: sslConfig,
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

let schemaInitPromise: Promise<boolean> | null = null;

export async function ensureTablesExist(): Promise<boolean> {
  if (globalForPg.isDbInitialized) return true;
  if (schemaInitPromise) return schemaInitPromise;

  schemaInitPromise = (async () => {
    try {
      const { initDatabase } = await import('./init-db');
      const ok = await initDatabase();
      if (ok) {
        globalForPg.isDbInitialized = true;
      }
      return ok;
    } catch (err) {
      console.error('[PostgreSQL Schema Auto-Init Error]:', err);
      return false;
    } finally {
      schemaInitPromise = null;
    }
  })();

  return schemaInitPromise;
}

// Eagerly trigger table creation on server start
ensureTablesExist().catch((err) => {
  console.warn('[PostgreSQL Eager Init Warning]:', err?.message || err);
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  let client;
  try {
    client = await pool.connect();
  } catch (err: any) {
    console.error('[PostgreSQL] Connection attempt failed:', err?.message || err);
    throw new DbConnectionError('Unable to connect to PostgreSQL database.');
  }

  try {
    const res = await client.query(text, params);
    return res.rows;
  } catch (err: any) {
    // 42P01: relation "..." does not exist
    if (err?.code === '42P01' || String(err?.message || '').includes('does not exist')) {
      console.warn('[PostgreSQL Auto-Migrate] Missing table detected (42P01). Automatically initializing database schema...');
      const success = await ensureTablesExist();
      if (success) {
        const retryRes = await client.query(text, params);
        return retryRes.rows;
      }
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function checkDbHealth(): Promise<boolean> {
  try {
    const rows = await query('SELECT 1 as alive');
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  let client;
  try {
    client = await pool.connect();
  } catch (err: any) {
    console.error('[PostgreSQL] Connection attempt failed during transaction:', err?.message || err);
    throw new DbConnectionError('Unable to connect to PostgreSQL database.');
  }

  const runTx = async () => {
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err: any) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('[PostgreSQL] Rollback error:', rollbackErr);
      }
      throw err;
    }
  };

  try {
    return await runTx();
  } catch (err: any) {
    if (err?.code === '42P01' || String(err?.message || '').includes('does not exist')) {
      console.warn('[PostgreSQL Auto-Migrate] Missing table in transaction (42P01). Automatically initializing database schema...');
      const success = await ensureTablesExist();
      if (success) {
        return await runTx();
      }
    }
    throw err;
  } finally {
    client.release();
  }
}
