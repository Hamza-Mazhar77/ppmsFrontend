
import { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function Modal({ open, title, subtitle, onClose, children, footer, size = 'md' }) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocus.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    // Move focus into the dialog so keyboard users are not left behind it.
    window.requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        // Only a click on the backdrop itself closes the dialog.
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className={'modal' + (size === 'lg' ? ' modal-lg' : '')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{title}</h2>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Yes/no confirmation used before destructive admin actions.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  busy = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? undefined : onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={'btn btn-' + variant} onClick={onConfirm} disabled={busy}>
            {busy && <span className="btn-spinner" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
        <span
          className="state-icon"
          style={{ width: 38, height: 38, background: 'var(--danger-soft)', color: 'var(--danger)' }}
          aria-hidden="true"
        >
          <AlertTriangle size={18} />
        </span>
        <p className="text-sm text-muted">{message}</p>
      </div>
    </Modal>
  );
}
