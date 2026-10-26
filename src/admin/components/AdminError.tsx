interface AdminErrorProps {
  message: string
  onRetry?: () => void
}

function AdminError({ message, onRetry }: AdminErrorProps) {
  return (
    <div className="admin-alert admin-alert--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="admin-btn admin-btn--small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export default AdminError
