import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children?: ReactNode
  actions: ReactNode
  tone?: 'default' | 'danger' | 'success'
}

// Uses the native <dialog>: it centers itself, traps focus and closes on Esc.
function Modal({ open, title, onClose, children, actions, tone = 'default' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  // The dialog has to be opened and closed through its DOM methods, so we sync it after render
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className={`modal modal--${tone}`} onClose={onClose} aria-labelledby="modal-title">
      {open && (
        <>
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          {children && <div className="modal-body">{children}</div>}
          <div className="modal-actions">{actions}</div>
        </>
      )}
    </dialog>
  )
}

export default Modal
