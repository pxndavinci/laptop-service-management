import { Kysely, PostgresDialect, sql } from 'kysely'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
})

export const kysely = new Kysely<any>({
  dialect: new PostgresDialect({ pool }),
})

export { sql }

export default kysely
