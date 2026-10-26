import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'

interface Result<T> {
  key: string
  data?: T
  error?: string
}

// Fetches `path` whenever it changes. Each result is tagged with the request it belongs to,
// so `loading` is simply "the latest result is not for the current request yet".
// While reloading, the previous data stays available so lists don't flicker.
export function useApi<T>(path: string) {
  const [attempt, setAttempt] = useState(0)
  const key = `${path}#${attempt}`
  const [result, setResult] = useState<Result<T>>({ key: '' })

  // Runs in the browser after render; the cleanup aborts the request if `path` changes first
  useEffect(() => {
    const controller = new AbortController()
    apiGet<T>(path, controller.signal)
      .then((data) => setResult({ key, data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setResult({ key, error: err instanceof Error ? err.message : 'Something went wrong.' })
      })
    return () => controller.abort()
  }, [path, key])

  const loading = result.key !== key
  return {
    data: result.data,
    error: loading ? undefined : result.error,
    loading,
    retry: () => setAttempt((n) => n + 1),
  }
}
