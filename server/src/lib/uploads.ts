import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

// server/uploads (this file lives in src/lib or dist/lib)
export const UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads')

export type ImageType = 'jpg' | 'png' | 'webp'

// Looks at the first bytes of the file ("magic numbers"), so a renamed .txt can't pass as an image.
export function detectImageType(data: Buffer): ImageType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'jpg'
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (data.subarray(0, 4).toString('latin1') === 'RIFF' && data.subarray(8, 12).toString('latin1') === 'WEBP') {
    return 'webp'
  }
  return null
}

export async function saveUpload(data: Buffer, type: ImageType): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true })
  const fileName = `${randomUUID()}.${type}`
  await writeFile(path.join(UPLOAD_DIR, fileName), data)
  return `/uploads/${fileName}`
}

// Only URLs we generated ourselves; this also blocks paths like /uploads/../.env
export function isUploadUrl(url: string): boolean {
  return /^\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(url)
}

export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url || !isUploadUrl(url)) return
  try {
    await rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true })
  } catch (err) {
    console.error('Could not delete upload', url, err)
  }
}
