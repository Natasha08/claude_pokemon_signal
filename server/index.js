import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173'

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ORIGIN,
  credentials: true,
}))

app.use('/api/auth', authRoutes)

app.use(express.static(join(__dirname, '../dist')))
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
