/**
 * Neon Serverless PostgreSQL connection pool.
 *
 * Usage:
 *   import { pool, query, withTransaction, withOrgScope } from '@azh/database/connection';
 *
 * Environment:
 *   DATABASE_URL — Neon connection string (postgres://user:pass@host/db?sslmode=require)
 */

import { neon, neonConfig, Pool } from '@neondatabase/serverless';

// fetchConnectionCache is now always true by default in newer versions

let _pool = null;

/**
 * Get or create the connection pool.
 * Lazy-initialized on first call.
 */
export function getPool() {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    _pool = new Pool({ connectionString });
  }
  return _pool;
}

/**
 * Execute a single SQL query.
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {any[]} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params = []) {
  const pool = getPool();
  return pool.query(text, params);
}

/**
 * Execute work inside a transaction.
 * Automatically commits on success, rolls back on error.
 *
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Execute work scoped to an organization (sets RLS context).
 * Sets `app.current_org_id` for the duration of the transaction.
 *
 * @param {string} orgId - Organization UUID
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withOrgScope(orgId, fn) {
  return withTransaction(async (client) => {
    await client.query('SET LOCAL app.current_org_id = $1', [orgId]);
    return fn(client);
  });
}

/**
 * Run a single query scoped to an organization.
 * Convenience wrapper for simple org-scoped reads/writes.
 *
 * @param {string} orgId - Organization UUID
 * @param {string} text - SQL query
 * @param {any[]} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function orgQuery(orgId, text, params = []) {
  return withOrgScope(orgId, (client) => client.query(text, params));
}

/**
 * Run SQL migrations in order.
 * Reads .sql files from the migrations directory.
 *
 * @param {string} migrationsDir - Absolute path to migrations directory
 */
export async function runMigrations(migrationsDir) {
  const { readdir, readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');

  const files = (await readdir(migrationsDir))
    .filter(f => f.endsWith('.sql'))
    .sort();

  const pool = getPool();

  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), 'utf-8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`Completed: ${file}`);
  }
}

/**
 * Gracefully close the pool.
 */
export async function closePool() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

export { neon };
