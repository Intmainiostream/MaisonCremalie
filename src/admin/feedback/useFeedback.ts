import { useContext } from 'react'
import { FeedbackContext } from './FeedbackContext'

export function useFeedback() {
  const feedback = useContext(FeedbackContext)
  if (!feedback) throw new Error('useFeedback must be used inside <FeedbackProvider>')
  return feedback
}
