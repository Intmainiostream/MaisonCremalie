import type { Request, RequestHandler } from 'express'
import { HttpError } from '../lib/http-error.js'
import { prisma } from '../lib/prisma.js'
import { passwordVersion, readSessionCookie } from '../lib/session-cookie.js'
import { verifyToken } from '../lib/token.js'

// Like Laravel's 'auth' middleware: stops the request with 401 unless a valid session cookie is sent.
export const requireAdmin: RequestHandler = async (req, _res, next) => {
  const token = readSessionCookie(req)
  const payload = token ? verifyToken(token) : null
  const admin = payload ? await prisma.adminUser.findUnique({ where: { id: payload.sub } }) : null

  if (!admin || passwordVersion(admin.passwordHash) !== payload?.pv) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Please log in to continue.')
  }
  req.admin = { id: admin.id, email: admin.email }
  next()
}

// For handlers that run after requireAdmin.
export function currentAdmin(req: Request): { id: number; email: string } {
  if (!req.admin) throw new HttpError(401, 'UNAUTHENTICATED', 'Please log in to continue.')
  return req.admin
}
