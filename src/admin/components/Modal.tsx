import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { AlertIcon, CheckIcon, TrashIcon } from './icons'

export type ModalTone = 'default' | 'danger' | 'success' | 'error'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children?: ReactNode
  actions?: ReactNode
  tone?: ModalTone
}

const toneIcons: Partial<Record<ModalTone, ReactNode>> = {
  success: <CheckIcon />,
  error: <AlertIcon />,
  danger: <TrashIcon />,
}

// Uses the native <dialog>: it centers itself, dims the page, traps focus and closes on Esc.
function Modal({ open, title, onClose, children, actions, tone = 'default' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const bodyId = useId()

  // The dialog has to be opened and closed through its DOM methods, so we sync it after render
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // A click that lands on the <dialog> itself (not its content) is a click on the dimmed backdrop
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) event.currentTarget.close()
  }

  const icon = toneIcons[tone]
  return (
    <dialog
      ref={ref}
      className={`modal modal--${tone}`}
      role={tone === 'error' ? 'alertdialog' : undefined}
      aria-labelledby={titleId}
      aria-describedby={children ? bodyId : undefined}
      tabIndex={-1}
      onClose={onClose}
      onClick={handleClick}
    >
      {open && (
        <div className="modal-content">
          {icon && (
            <span className="modal-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          {children && (
            <div id={bodyId} className="modal-body">
              {children}
            </div>
          )}
          {actions && <div className="modal-actions">{actions}</div>}
        </div>
      )}
    </dialog>
  )
}

export default Modal
