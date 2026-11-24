import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Pool } from 'pg'

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  : null

export async function initializeDatabase(): Promise<void> {
  if (!pool) return
  const schema = await readFile(path.resolve(process.cwd(), 'server/schema.sql'), 'utf8')
  await pool.query(schema)
}
