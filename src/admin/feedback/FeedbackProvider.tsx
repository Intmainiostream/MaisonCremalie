import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Modal from '../components/Modal'
import { FeedbackContext, type Feedback } from './FeedbackContext'

const AUTO_CLOSE_MS = 1800

interface Notice {
  tone: 'success' | 'error'
  title: string
  message?: string
  onClose?: () => void
}

// One popup for every admin page, like a flash message in Laravel but shown as a centered modal.
function FeedbackProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null)

  const close = useCallback(() => {
    if (!notice) return
    setNotice(null)
    notice.onClose?.()
  }, [notice])

  // Success popups close themselves; errors wait for the admin
  useEffect(() => {
    if (notice?.tone !== 'success') return
    const timer = setTimeout(close, AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [notice, close])

  const feedback: Feedback = {
    success: (title, message, options) => setNotice({ tone: 'success', title, message, onClose: options?.onClose }),
    error: (title, message) => setNotice({ tone: 'error', title, message }),
  }

  return (
    <FeedbackContext.Provider value={feedback}>
      {children}
      <Modal
        open={notice !== null}
        tone={notice?.tone ?? 'success'}
        title={notice?.title ?? ''}
        onClose={close}
        actions={
          notice?.tone === 'error' && (
            <button type="button" className="admin-btn admin-btn--primary" onClick={close}>
              OK
            </button>
          )
        }
      >
        {notice?.message && <p>{notice.message}</p>}
      </Modal>
    </FeedbackContext.Provider>
  )
}

export default FeedbackProvider
