import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import { env } from './config/env.js'
import { errorBody, HttpError } from './lib/http-error.js'
import { UPLOAD_DIR } from './lib/uploads.js'
import { adminRouter } from './routes/admin/index.js'
import { authRouter } from './routes/auth.js'
import { categoriesRouter } from './routes/categories.js'
import { healthRouter } from './routes/health.js'
import { productsRouter } from './routes/products.js'

function isBadJson(err: unknown): boolean {
  return err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed'
}

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
  app.use(express.json({ limit: '100kb' }))

  // Uploaded product images, e.g. /uploads/<uuid>.webp
  app.use(
    '/uploads',
    express.static(UPLOAD_DIR, {
      index: false,
      dotfiles: 'ignore',
      maxAge: '7d',
      setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
    }),
  )

  // API answers are never cached, so admin changes show up on the next page load
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Routers are mounted under a prefix, like Route::prefix('api/products')->group(...)
  app.use('/api/health', healthRouter)
  app.use('/api/categories', categoriesRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/admin', adminRouter)

  app.use((_req, res) => {
    res.status(404).json(errorBody('NOT_FOUND', 'Not found.'))
  })

  // Express 5 forwards errors thrown in async routes here, like Laravel's exception handler.
  // It is recognized as an error handler by its 4 arguments.
  const handleError: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json(errorBody(err.code, err.message, err.fields))
      return
    }
    if (isBadJson(err)) {
      res.status(400).json(errorBody('INVALID_JSON', 'The request body is not valid JSON.'))
      return
    }
    console.error(err)
    res.status(500).json(errorBody('INTERNAL_ERROR', 'Something went wrong.'))
  }
  app.use(handleError)

  return app
}
