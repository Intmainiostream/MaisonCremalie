import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'

const server = createApp().listen(env.PORT, () => {
  console.log(`Maison Crémalie API listening on http://localhost:${env.PORT}`)
})

function shutdown() {
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0))
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
