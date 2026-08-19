/**
 * Loading, empty and error placeholders
 * Every list in the application uses these, so a user is never left staring at
 * a blank table without an explanation.
 */
import { Inbox, AlertTriangle, RefreshCw } from 'lucide-react';

/** Centred spinner with an accessible label. */
export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="state-block" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="state-text">{label}</p>
    </div>
  );
}

/** Shimmering placeholder rows, used while a table loads. */
export function TableSkeleton({ rows = 4, columns = 6 }) {
  return (
    <div style={{ padding: '1rem 1.25rem' }} aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0' }}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div key={colIndex} className="skeleton" style={{ flex: colIndex === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * "Nothing here yet" state.
 * @param {{icon?: Function, title: string, message?: string, action?: React.ReactNode}} props
 */
export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="state-block">
      <span className="state-icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <p className="state-title">{title}</p>
      {message && <p className="state-text">{message}</p>}
      {action}
    </div>
  );
}

/** Failure state with an optional retry button. */
export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-block" role="alert">
      <span className="state-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }} aria-hidden="true">
        <AlertTriangle size={22} />
      </span>
      <p className="state-title">{title}</p>
      {message && <p className="state-text">{message}</p>}
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
