import { CamelCasePlugin, Kysely, PostgresDialect, Transaction } from 'kysely';
import { Pool, types } from 'pg';
import { Database } from './schema';

// pg returns NUMERIC and BIGINT (e.g. COUNT results) as strings to avoid
// precision loss; the values in this schema stay far below MAX_SAFE_INTEGER.
types.setTypeParser(types.builtins.NUMERIC, Number);
types.setTypeParser(types.builtins.INT8, Number);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});

/** Accepts either the root connection or an open transaction. */
export type DbExecutor = Kysely<Database> | Transaction<Database>;

export default db;
