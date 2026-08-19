/**
 * Rejection dialog
 * A reason is mandatory - the server refuses a rejection without one - so this
 * offers the four standard reasons as one-click choices plus a free-text box
 * for anything else. The chosen text is stored on the paper and shown to the
 * student in their Upload History.
 */
import { useEffect, useState } from 'react';
import Modal from './Modal';

const PRESET_REASONS = [
  'Duplicate paper',
  'Invalid or low-quality scan',
  'Incorrect metadata',
  'Not a valid past paper',
];

export default function RejectPaperDialog({ open, paper, busy, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Start from a clean slate each time the dialog opens.
  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const submit = (event) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError('Please provide a rejection reason of at least 5 characters.');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal
      open={open}
      title="Reject Paper"
      subtitle={paper ? paper.courseName + ' (' + paper.courseCode + ')' : undefined}
      onClose={busy ? undefined : onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="reject-paper-form" className="btn btn-danger" disabled={busy}>
            {busy && <span className="btn-spinner" aria-hidden="true" />}
            Reject paper
          </button>
        </>
      }
    >
      <form id="reject-paper-form" onSubmit={submit} className="stack gap-4" noValidate>
        <div className="form-field">
          <span className="form-label" id="preset-reasons-label">
            Common reasons
          </span>
          <div className="row gap-2 wrap" role="group" aria-labelledby="preset-reasons-label">
            {PRESET_REASONS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={'tab' + (reason === preset ? ' active' : '')}
                onClick={() => {
                  setReason(preset);
                  setError('');
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="reject-reason">
            Rejection reason<span className="required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="reject-reason"
            className={'form-control ' + (error ? 'is-invalid' : '')}
            rows={3}
            maxLength={300}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError('');
            }}
            placeholder="Explain why this paper cannot be published. The student will see this message."
          />
          <span className="form-hint">{reason.length}/300 characters. This reason is stored and shown to the uploader.</span>
          {error && (
            <span className="form-error" role="alert">
              {error}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}
