import 'dotenv/config'
import sql from './db.js'

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )
`

await sql`ALTER TABLE users DROP COLUMN IF EXISTS name`
await sql`ALTER TABLE users DROP COLUMN IF EXISTS email`

console.log('Migration complete')
await sql.end()
