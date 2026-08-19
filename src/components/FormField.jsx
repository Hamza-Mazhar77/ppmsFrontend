
import { forwardRef } from 'react';
import { AlertCircle, Lock } from 'lucide-react';

export function Field({ id, label, required, hint, error, children, className = '' }) {
  const describedBy = [error ? id + '-error' : null, hint ? id + '-hint' : null].filter(Boolean).join(' ');

  return (
    <div className={'form-field ' + className}>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="required" aria-hidden="true">*</span>}
        </label>
      )}
      {typeof children === 'function' ? children({ describedBy: describedBy || undefined }) : children}
      {hint && !error && (
        <span className="form-hint" id={id + '-hint'}>
          {hint}
        </span>
      )}
      {error && (
        <span className="form-error" id={id + '-error'} role="alert">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

/** Text/email/password input with an optional leading icon. */
export const TextInput = forwardRef(function TextInput(
  { id, icon: Icon, error, className = '', ...props },
  ref
) {
  const control = (
    <input
      id={id}
      ref={ref}
      className={'form-control ' + (error ? 'is-invalid ' : '') + className}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  );

  if (!Icon) return control;

  return (
    <div className="input-wrap has-icon">
      <Icon size={15} aria-hidden="true" />
      {control}
    </div>
  );
});

/** Native select styled to match the report screenshots. */
export const SelectInput = forwardRef(function SelectInput(
  { id, icon: Icon, error, children, className = '', ...props },
  ref
) {
  const control = (
    <select
      id={id}
      ref={ref}
      className={'form-control ' + (error ? 'is-invalid ' : '') + className}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    >
      {children}
    </select>
  );

  if (!Icon) return control;

  return (
    <div className="input-wrap has-icon">
      <Icon size={15} aria-hidden="true" />
      {control}
    </div>
  );
});

/**
 * Read-only display of a value the server derives (course code, program,
 * college, semester). Rendered as a disabled-looking input so it visually
 * matches the surrounding form while being impossible to edit.
 */
export function AutoFilledField({ id, label, value, placeholder = 'Auto-filled', icon: Icon = Lock }) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label} <span className="autofill-note">(Auto-filled)</span>
      </label>
      <div className={Icon ? 'input-wrap has-icon' : 'input-wrap'}>
        {Icon && <Icon size={14} aria-hidden="true" />}
        <input
          id={id}
          className="form-control"
          value={value || ''}
          placeholder={placeholder}
          readOnly
          tabIndex={-1}
          aria-readonly="true"
        />
      </div>
    </div>
  );
}
