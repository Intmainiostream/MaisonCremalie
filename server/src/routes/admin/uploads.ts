import path from 'node:path'
import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { HttpError } from '../../lib/http-error.js'
import { detectImageType, saveUpload } from '../../lib/uploads.js'

export const adminUploadsRouter = Router()

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// Keeps the file in memory so we can check its real type before anything touches the disk.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES, files: 1 } }).single('image')

// Multer uses callbacks; this turns it into a promise so errors reach our error handler.
function receiveFile(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    upload(req, res, (err: unknown) => (err ? reject(err) : resolve()))
  })
}

// POST /api/admin/uploads  (multipart form, field "image")
adminUploadsRouter.post('/', async (req, res) => {
  try {
    await receiveFile(req, res)
  } catch (err) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      throw new HttpError(413, 'FILE_TOO_LARGE', 'Images must be 2 MB or smaller.')
    }
    if (err instanceof multer.MulterError) {
      throw new HttpError(400, 'UPLOAD_FAILED', 'Please send one image in a field named "image".')
    }
    throw err
  }

  const file = req.file
  if (!file) throw new HttpError(400, 'NO_FILE', 'Please choose an image to upload.')

  const extension = path.extname(file.originalname).toLowerCase()
  const type = detectImageType(file.buffer)
  if (!ALLOWED_EXTENSIONS.includes(extension) || !type) {
    throw new HttpError(415, 'INVALID_FILE_TYPE', 'Only JPG, PNG and WebP images are allowed.')
  }

  // Saved with the extension of its real type, under a random name
  res.status(201).json({ url: await saveUpload(file.buffer, type) })
})
