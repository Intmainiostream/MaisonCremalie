import { ApiError } from '../lib/api'

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
}

// Per-field messages from a 422 response, e.g. { slug: 'Another product already uses this slug.' }
export function fieldErrors(err: unknown): Record<string, string> {
  return err instanceof ApiError && err.fields ? err.fields : {}
}
