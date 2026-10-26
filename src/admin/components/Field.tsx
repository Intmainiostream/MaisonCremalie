import type { ReactNode } from 'react'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

// Label, input and error message. Give the input aria-describedby={`${id}-error`} so screen readers read the error.
function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className={`admin-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="admin-field-hint">{hint}</p>}
      {error && (
        <p className="admin-field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default Field
