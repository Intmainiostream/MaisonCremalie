import { HttpError } from './http-error.js'

export function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === 'object' && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : {}
}

export function trimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// Route params arrive as strings; anything that isn't a positive integer is treated as "not found".
export function parseId(value: string | undefined, what: string): number {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, 'NOT_FOUND', `${what} not found.`)
  return id
}

// Lowercase, accents removed, words joined by dashes: "Chou Fraise Éternelle" -> "chou-fraise-eternelle"
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
