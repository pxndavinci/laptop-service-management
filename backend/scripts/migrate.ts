/**
 * Applies SQL files from backend/migrations that have not run yet, in name
 * order, each in its own transaction, and records them in schema_migrations.
 *
 * schema.sql only initialises an empty database, so every schema change after
 * the first deploy must ship as a new migration file (e.g. 0002_add_x.sql).
 * Write migrations to be idempotent (IF NOT EXISTS) so they are also safe on
 * a fresh database that already got the change from schema.sql.
 *
 *   npm run migrate            (runs automatically when the container starts)
 */
import fs from 'fs';
import path from 'path';
import { sql } from 'kysely';
import db from '../src/db/index';

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'migrations');
const FALLBACK_DIR = path.resolve(__dirname, '..', 'migrations'); // when run with tsx from scripts/
// Arbitrary constant: serialises concurrent migrators (two containers starting at once)
const LOCK_KEY = 72_455_301;

export async function migrate(log: (line: string) => void = console.log): Promise<number> {
  const dir = fs.existsSync(MIGRATIONS_DIR) ? MIGRATIONS_DIR : FALLBACK_DIR;
  const files = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => name.endsWith('.sql'))
        .sort()
    : [];

  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `.execute(db);

  return db.connection().execute(async (conn) => {
    await sql`select pg_advisory_lock(${LOCK_KEY})`.execute(conn);
    try {
      const applied = new Set(
        (await sql<{ name: string }>`select name from schema_migrations`.execute(conn)).rows.map(
          (row) => row.name
        )
      );
      let count = 0;
      for (const name of files.filter((file) => !applied.has(file))) {
        const body = fs.readFileSync(path.join(dir, name), 'utf8');
        await conn.transaction().execute(async (trx) => {
          await sql.raw(body).execute(trx);
          await sql`insert into schema_migrations (name) values (${name})`.execute(trx);
        });
        log(`migration applied: ${name}`);
        count += 1;
      }
      if (count === 0) log('migrations: up to date');
      return count;
    } finally {
      await sql`select pg_advisory_unlock(${LOCK_KEY})`.execute(conn);
    }
  });
}

if (require.main === module) {
  migrate()
    .then(() => db.destroy())
    .catch(async (error) => {
      console.error(`Migration failed: ${error instanceof Error ? error.message : error}`);
      await db.destroy();
      process.exit(1);
    });
}
