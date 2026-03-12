import 'dotenv/config'
console.log('DATABASE_URL:', process.env.DATABASE_URL)
import sql from './db.js'

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    name      TEXT NOT NULL,
    username  TEXT UNIQUE NOT NULL,
    email     TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`

console.log('Migration complete')
await sql.end()
