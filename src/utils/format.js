/**
 * Small display helpers shared by the tables and detail screens.
 */

/** ISO timestamp -> 2024-06-15 (the format used in the report tables). */
export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

/** ISO timestamp -> locale date and time, used by the download history. */
export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Bytes -> "1640 KB" / "2.10 MB". */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/** First letter of a name, for the circular avatars. */
export function initialOf(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

/** Truncate long values (college names) for narrow table cells. */
export function truncate(value, length = 28) {
  const text = String(value || '');
  return text.length > length ? text.slice(0, length - 3) + '...' : text;
}

/**
 * Password strength 0-4, used by the meter on the registration form.
 * Mirrors the server's policy: length, letters, digits, symbols.
 */
export function passwordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score += 1;
  return score;
}

export const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
export const STRENGTH_CLASSES = ['', 'weak', 'fair', 'good', 'strong'];
