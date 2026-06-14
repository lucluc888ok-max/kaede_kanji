import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import sessionsRouter from './routes/sessions'
import coinsRouter from './routes/coins'
import shopRouter from './routes/shop'
import adviceRouter from './routes/advice'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/sessions', sessionsRouter)
app.use('/api/coins', coinsRouter)
app.use('/api/shop', shopRouter)
app.use('/api/advice', adviceRouter)

app.listen(PORT, () => {
  console.log(`🐣 server running on port ${PORT}`)
})
