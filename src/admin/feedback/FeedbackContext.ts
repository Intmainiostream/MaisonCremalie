import { createContext } from 'react'

export interface Feedback {
  /** Centered "it worked" popup. Closes by itself; `onClose` runs once it has closed (e.g. go back to the list). */
  success: (title: string, message?: string, options?: { onClose?: () => void }) => void
  /** Centered error popup. Stays open until the admin closes it. */
  error: (title: string, message?: string) => void
}

export const FeedbackContext = createContext<Feedback | null>(null)
