import { Router } from 'express'
import { HttpError, validationError } from '../lib/http-error.js'
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { attemptKey, loginLimiter } from '../lib/rate-limit.js'
import { clearSessionCookie, setSessionCookie } from '../lib/session-cookie.js'
import { asRecord, trimmed } from '../lib/validate.js'
import { currentAdmin, requireAdmin } from '../middleware/require-admin.js'

export const authRouter = Router()

// Checked when the email is unknown, so both failure cases take about the same time.
const dummyHash = hashPassword('not-a-real-password')

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const body = asRecord(req.body)
  const email = trimmed(body['email']).toLowerCase()
  const password = typeof body['password'] === 'string' ? body['password'] : ''
  if (!email || !password) {
    throw new HttpError(400, 'MISSING_CREDENTIALS', 'Please enter your email and password.')
  }

  const key = attemptKey(req.ip, email)
  const wait = loginLimiter.retryAfter(key)
  if (wait > 0) {
    res.set('Retry-After', String(wait))
    throw new HttpError(429, 'TOO_MANY_ATTEMPTS', `Too many tries. Please wait ${Math.ceil(wait / 60)} minutes and try again.`)
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  const valid = await verifyPassword(password, admin?.passwordHash ?? (await dummyHash))
  if (!admin || !valid) {
    loginLimiter.record(key)
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'That email and password do not match.')
  }

  loginLimiter.clear(key)
  setSessionCookie(res, admin)
  res.json({ admin: { id: admin.id, email: admin.email } })
})

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res)
  res.status(204).end()
})

// GET /api/auth/me
authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: currentAdmin(req) })
})

// POST /api/auth/change-password
authRouter.post('/change-password', requireAdmin, async (req, res) => {
  const body = asRecord(req.body)
  const currentPassword = typeof body['currentPassword'] === 'string' ? body['currentPassword'] : ''
  const newPassword = typeof body['newPassword'] === 'string' ? body['newPassword'] : ''

  const admin = await prisma.adminUser.findUniqueOrThrow({ where: { id: currentAdmin(req).id } })
  if (!currentPassword || !(await verifyPassword(currentPassword, admin.passwordHash))) {
    throw validationError({ currentPassword: 'Your current password is not correct.' })
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw validationError({ newPassword: `Use at least ${MIN_PASSWORD_LENGTH} characters.` })
  }
  if (newPassword.length > 200) {
    throw validationError({ newPassword: 'Use at most 200 characters.' })
  }

  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(newPassword) },
  })
  // Old sessions stop working because the password fingerprint changed; give this one a fresh cookie.
  setSessionCookie(res, updated)
  res.json({ ok: true })
})
