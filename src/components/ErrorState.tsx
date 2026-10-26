import Mascot from './illustrations/Mascot'
import './ErrorState.css'

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <Mascot className="error-state-mascot" />
      <p className="error-state-title">Oh no, a little kitchen mishap!</p>
      <p className="error-state-message">{message}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

export default ErrorState
