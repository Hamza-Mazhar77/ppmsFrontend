
import { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

/** Human readable file size. */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function FileDropzone({ file, onChange, maxSizeMb = 10, error, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const validateAndSet = (candidate) => {
    setLocalError('');
    if (!candidate) return;

    const isPdfName = candidate.name.toLowerCase().endsWith('.pdf');
    const isPdfType = candidate.type === 'application/pdf';
    if (!isPdfName || !isPdfType) {
      setLocalError('Only PDF files are accepted. Please choose a .pdf document.');
      onChange(null);
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      setLocalError('This file is ' + formatSize(candidate.size) + '. The maximum allowed size is ' + maxSizeMb + ' MB.');
      onChange(null);
      return;
    }
    onChange(candidate);
  };

  const clear = () => {
    onChange(null);
    setLocalError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const message = error || localError;

  return (
    <div className="form-field">
      <label className="form-label" htmlFor="paper-file">
        Upload PDF<span className="required" aria-hidden="true">*</span>
      </label>

      <div
        className={
          'dropzone' +
          (dragging ? ' is-active' : '') +
          (file ? ' has-file' : '') +
          (message ? ' is-invalid' : '')
        }
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) return;
          validateAndSet(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="dropzone-icon" aria-hidden="true">
          {file ? <FileText size={26} /> : <Upload size={26} />}
        </span>

        {file ? (
          <>
            <span className="dropzone-filename">
              {file.name} ({formatSize(file.size)})
            </span>
            <div className="dropzone-row">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                Choose File
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={clear} disabled={disabled}>
                <X size={13} />
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="dropzone-filename">Drag and drop your past paper here</span>
            <div className="dropzone-row">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                Choose File
              </button>
              <span className="dropzone-hint">No file chosen</span>
            </div>
          </>
        )}

        <span className="dropzone-hint">PDF only. Maximum size {maxSizeMb} MB.</span>

        <input
          ref={inputRef}
          id="paper-file"
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => validateAndSet(event.target.files?.[0])}
        />
      </div>

      {message && (
        <span className="form-error" role="alert">
          {message}
        </span>
      )}
    </div>
  );
}
