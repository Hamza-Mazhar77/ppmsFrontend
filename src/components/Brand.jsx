
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function Brand({ to = '/', showTagline = true }) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <FileText size={18} strokeWidth={2} />
      </span>
      <span className="brand-text">
        <span className="brand-name-row">
          <span className="brand-name">PaperHub</span>
          <span className="brand-pill">PPMS</span>
        </span>
        {showTagline && <span className="brand-tagline">QAU Affiliated Colleges System</span>}
      </span>
    </>
  );

  if (!to) return <span className="brand">{content}</span>;

  return (
    <Link to={to} className="brand" aria-label="PaperHub - Past Papers Management System, home">
      {content}
    </Link>
  );
}
