import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sql from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const COOKIE = 'session'
const COOKIE_OPTS = { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' }

router.post('/signup', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const [usernameTaken] = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`
  if (usernameTaken) return res.status(409).json({ error: 'That username is already taken' })

  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await sql`
    INSERT INTO users (username, password_hash)
    VALUES (${username}, ${passwordHash})
    RETURNING id, username
  `

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.cookie(COOKIE, token, COOKIE_OPTS)
  res.json({ user })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const [user] = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`
  if (!user) return res.status(401).json({ error: 'Invalid username or password' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' })

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.cookie(COOKIE, token, COOKIE_OPTS)
  res.json({ user: { id: user.id, username: user.username } })
})

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE)
  res.json({ ok: true })
})

router.get('/me', async (req, res) => {
  const token = req.cookies[COOKIE]
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const { userId } = jwt.verify(token, JWT_SECRET)
    const [user] = await sql`SELECT id, username FROM users WHERE id = ${userId}`
    if (!user) return res.status(401).json({ error: 'Not authenticated' })
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

export default router
