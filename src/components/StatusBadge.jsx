
import { CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';

const CONFIG = {
  approved: { label: 'Approved', className: 'badge-approved', Icon: CheckCircle2 },
  pending: { label: 'Pending', className: 'badge-pending', Icon: Clock },
  rejected: { label: 'Rejected', className: 'badge-rejected', Icon: XCircle },
  removed: { label: 'Removed', className: 'badge-removed', Icon: Trash2 },
};

export default function StatusBadge({ status, label }) {
  const config = CONFIG[status] || CONFIG.pending;
  const { Icon } = config;

  return (
    <span className={'badge ' + config.className}>
      <Icon size={12} aria-hidden="true" />
      {label || config.label}
    </span>
  );
}
