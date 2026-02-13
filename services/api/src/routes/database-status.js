/**
 * Database Status Routes — Admin-only database health dashboard
 *
 * Provides real-time database metrics:
 *   - Connection status and pool info
 *   - Table sizes, row counts, index sizes
 *   - Migration history
 *   - PostgreSQL version and settings
 */

import { requireRole } from '@azh/shared-auth/rbac';

// Lazy import: only load @azh/database when the endpoint is hit
let _db = null;
async function db() {
  if (!_db) _db = await import('@azh/database');
  return _db;
}

export default async function databaseStatusRoutes(app) {

  app.get('/api/admin/database-status', {
    preHandler: [requireRole('admin')],
  }, async (request, reply) => {
    // If database is not configured, return a clear offline status
    if (!process.env.DATABASE_URL) {
      return {
        connected: false,
        mode: 'file',
        message: 'Database not configured. Using file-based storage.',
        use_database: process.env.USE_DATABASE === 'true',
      };
    }

    const { query } = await db();
    const start = Date.now();

    try {
      // 1. Connection test + basic info
      const connResult = await query(`
        SELECT
          current_database() AS database_name,
          current_user AS current_role,
          version() AS pg_version,
          pg_postmaster_start_time() AS server_start_time,
          now() AS server_time,
          inet_server_addr() AS server_host,
          inet_server_port() AS server_port
      `);
      const connInfo = connResult.rows[0];
      const latencyMs = Date.now() - start;

      // 2. Table sizes and row counts
      const tablesResult = await query(`
        SELECT
          t.tablename AS table_name,
          pg_size_pretty(pg_total_relation_size(quote_ident(t.tablename)::regclass)) AS total_size,
          pg_total_relation_size(quote_ident(t.tablename)::regclass) AS total_size_bytes,
          pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::regclass)) AS data_size,
          pg_relation_size(quote_ident(t.tablename)::regclass) AS data_size_bytes,
          pg_size_pretty(pg_total_relation_size(quote_ident(t.tablename)::regclass) - pg_relation_size(quote_ident(t.tablename)::regclass)) AS index_size,
          (pg_total_relation_size(quote_ident(t.tablename)::regclass) - pg_relation_size(quote_ident(t.tablename)::regclass)) AS index_size_bytes,
          COALESCE(s.n_live_tup, 0) AS row_count,
          COALESCE(s.n_dead_tup, 0) AS dead_rows,
          COALESCE(s.last_vacuum::text, 'never') AS last_vacuum,
          COALESCE(s.last_autovacuum::text, 'never') AS last_autovacuum,
          COALESCE(s.last_analyze::text, 'never') AS last_analyze
        FROM pg_tables t
        LEFT JOIN pg_stat_user_tables s ON s.relname = t.tablename
        WHERE t.schemaname = 'public'
          AND t.tablename NOT LIKE 'pg_%'
          AND t.tablename NOT LIKE '_supabase_%'
        ORDER BY pg_total_relation_size(quote_ident(t.tablename)::regclass) DESC
      `);

      // 3. Total database size
      const dbSizeResult = await query(`
        SELECT
          pg_size_pretty(pg_database_size(current_database())) AS total_size,
          pg_database_size(current_database()) AS total_size_bytes
      `);

      // 4. Index details
      const indexResult = await query(`
        SELECT
          indexrelname AS index_name,
          relname AS table_name,
          pg_size_pretty(pg_relation_size(indexrelid)) AS size,
          pg_relation_size(indexrelid) AS size_bytes,
          idx_scan AS scans,
          idx_tup_read AS tuples_read,
          idx_tup_fetch AS tuples_fetched
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 30
      `);

      // 5. Migration history (Supabase stores in supabase_migrations.schema_migrations)
      let migrations = [];
      try {
        const migResult = await query(`
          SELECT version, name, statements
          FROM supabase_migrations.schema_migrations
          ORDER BY version ASC
        `);
        migrations = migResult.rows.map(r => ({
          version: r.version,
          name: r.name || r.version,
          statements: r.statements?.length || 0,
        }));
      } catch {
        // Not on Supabase, or migrations table doesn't exist
        migrations = [];
      }

      // 6. Active connections
      const connCountResult = await query(`
        SELECT
          count(*) AS total,
          count(*) FILTER (WHERE state = 'active') AS active,
          count(*) FILTER (WHERE state = 'idle') AS idle,
          count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      // 7. Enum types
      const enumsResult = await query(`
        SELECT
          t.typname AS enum_name,
          array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typnamespace = 'public'::regnamespace
        GROUP BY t.typname
        ORDER BY t.typname
      `);

      // 8. RLS status per table
      const rlsResult = await query(`
        SELECT
          relname AS table_name,
          relrowsecurity AS rls_enabled,
          relforcerowsecurity AS rls_forced
        FROM pg_class
        WHERE relnamespace = 'public'::regnamespace
          AND relkind = 'r'
        ORDER BY relname
      `);

      // 9. RLS policies
      const policiesResult = await query(`
        SELECT
          schemaname,
          tablename AS table_name,
          policyname AS policy_name,
          permissive,
          roles,
          cmd AS command,
          qual AS using_expr
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
      `);

      // 10. Database settings relevant for health
      const settingsResult = await query(`
        SELECT name, setting, unit, short_desc
        FROM pg_settings
        WHERE name IN (
          'max_connections', 'shared_buffers', 'work_mem',
          'maintenance_work_mem', 'effective_cache_size',
          'statement_timeout', 'idle_in_transaction_session_timeout',
          'default_transaction_isolation'
        )
        ORDER BY name
      `);

      const tables = tablesResult.rows;
      const totalRows = tables.reduce((sum, t) => sum + parseInt(t.row_count || 0), 0);
      const totalDeadRows = tables.reduce((sum, t) => sum + parseInt(t.dead_rows || 0), 0);

      return {
        connected: true,
        mode: process.env.USE_DATABASE === 'true' ? 'database' : 'file',
        use_database: process.env.USE_DATABASE === 'true',
        latency_ms: latencyMs,

        server: {
          database_name: connInfo.database_name,
          current_role: connInfo.current_role,
          pg_version: connInfo.pg_version,
          server_start_time: connInfo.server_start_time,
          server_time: connInfo.server_time,
        },

        size: {
          total: dbSizeResult.rows[0].total_size,
          total_bytes: parseInt(dbSizeResult.rows[0].total_size_bytes),
        },

        connections: {
          total: parseInt(connCountResult.rows[0].total),
          active: parseInt(connCountResult.rows[0].active),
          idle: parseInt(connCountResult.rows[0].idle),
          idle_in_transaction: parseInt(connCountResult.rows[0].idle_in_transaction),
        },

        tables: tables.map(t => ({
          name: t.table_name,
          total_size: t.total_size,
          total_size_bytes: parseInt(t.total_size_bytes),
          data_size: t.data_size,
          data_size_bytes: parseInt(t.data_size_bytes),
          index_size: t.index_size,
          index_size_bytes: parseInt(t.index_size_bytes),
          row_count: parseInt(t.row_count),
          dead_rows: parseInt(t.dead_rows),
          last_vacuum: t.last_vacuum,
          last_autovacuum: t.last_autovacuum,
          last_analyze: t.last_analyze,
        })),

        summary: {
          table_count: tables.length,
          total_rows: totalRows,
          total_dead_rows: totalDeadRows,
        },

        indexes: indexResult.rows.map(i => ({
          name: i.index_name,
          table: i.table_name,
          size: i.size,
          size_bytes: parseInt(i.size_bytes),
          scans: parseInt(i.scans),
          tuples_read: parseInt(i.tuples_read),
          tuples_fetched: parseInt(i.tuples_fetched),
        })),

        enums: enumsResult.rows.map(e => ({
          name: e.enum_name,
          values: e.values,
        })),

        rls: rlsResult.rows.map(r => ({
          table: r.table_name,
          enabled: r.rls_enabled,
          forced: r.rls_forced,
        })),

        policies: policiesResult.rows.map(p => ({
          table: p.table_name,
          name: p.policy_name,
          permissive: p.permissive,
          roles: p.roles,
          command: p.command,
        })),

        migrations,

        settings: settingsResult.rows.map(s => ({
          name: s.name,
          value: s.setting,
          unit: s.unit,
          description: s.short_desc,
        })),
      };
    } catch (err) {
      reply.code(500);
      return {
        connected: false,
        mode: 'error',
        error: err.message,
        latency_ms: Date.now() - start,
      };
    }
  });
}
