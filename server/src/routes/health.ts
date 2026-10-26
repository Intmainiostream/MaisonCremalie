import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const healthRouter = Router()

// GET /api/health: confirms the server is up and the database answers.
healthRouter.get('/', async (_req, res) => {
  let database: 'up' | 'down' = 'up'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    database = 'down'
  }

  res.status(database === 'up' ? 200 : 503).json({
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    timestamp: new Date().toISOString(),
  })
})
