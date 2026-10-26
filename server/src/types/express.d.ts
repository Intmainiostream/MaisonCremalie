// Adds req.admin, set by the requireAdmin middleware.
declare global {
  namespace Express {
    interface Request {
      admin?: { id: number; email: string }
    }
  }
}

export {}
