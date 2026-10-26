export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; fields?: Record<string, string> }
}

// Fired when an admin request comes back 401 (e.g. the session expired), so the admin area can send you to login.
export const UNAUTHORIZED_EVENT = 'mc:unauthorized'

// Relative URLs: in dev, Vite's proxy forwards /api to the Express server on port 4000.
// The session cookie is sent automatically because the requests are same-origin.
export async function apiRequest<T>(
  method: string,
  path: string,
  body?: FormData | object,
  signal?: AbortSignal,
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(path, { method, headers, body: payload, signal })
  } catch (err) {
    if (signal?.aborted) throw err
    throw new ApiError(0, 'NETWORK_ERROR', "We couldn't reach the bakery. Please check your connection.")
  }

  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/api/admin')) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    const errorBody = (await res.json().catch(() => ({}))) as ErrorBody
    throw new ApiError(
      res.status,
      errorBody.error?.code ?? 'HTTP_ERROR',
      errorBody.error?.message ?? 'Our kitchen is having a moment. Please try again soon.',
      errorBody.error?.fields,
    )
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>('GET', path, undefined, signal)
}
