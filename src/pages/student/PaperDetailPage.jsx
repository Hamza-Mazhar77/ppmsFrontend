/**
 * Paper detail and download screen
 * Shows the full metadata for one paper, an embedded PDF viewer and the
 * View / Download actions. Access is decided by the API: an approved paper is
 * readable by any signed-in student, while a pending or rejected paper is only
 * visible to the student who uploaded it.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  BookOpen,
  Hash,
  GraduationCap,
  Building2,
  CalendarDays,
  Layers,
  FileType2,
  User,
  Clock,
  FileText,
  Info,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import PdfPreview from '../../components/PdfPreview';
import { LoadingState, ErrorState } from '../../components/States';
import { paperApi, downloadPaperFile, openPaperInNewTab } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatFileSize } from '../../utils/format';

export default function PaperDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return paperApi
      .getById(id)
      .then((response) => setPaper(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = async () => {
    setBusy(true);
    try {
      await downloadPaperFile(id);
      toast.success('Download started.');
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = async () => {
    setBusy(true);
    try {
      await openPaperInNewTab(id);
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingState label="Loading paper details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState
          title="Paper unavailable"
          message={error}
          onRetry={load}
        />
        <div className="card-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
            Go back
          </button>
        </div>
      </div>
    );
  }

  const details = [
    { label: 'Course Name', value: paper.courseName, icon: BookOpen },
    { label: 'Course Code', value: paper.courseCode, icon: Hash },
    { label: 'Degree Program', value: paper.programName, icon: GraduationCap },
    { label: 'College', value: paper.collegeName, icon: Building2 },
    { label: 'Semester', value: paper.semester, icon: Layers },
    { label: 'Year', value: paper.year, icon: CalendarDays },
    { label: 'Paper Type', value: paper.paperType, icon: FileType2 },
    { label: 'Uploaded By', value: paper.uploaderName, icon: User },
    { label: 'Uploaded Date', value: formatDate(paper.createdAt), icon: Clock },
    { label: 'File', value: paper.fileName + ' (' + formatFileSize(paper.fileSize) + ')', icon: FileText },
  ];

  const isApproved = paper.status === 'approved';

  return (
    <>
      <header className="page-header">
        <div>
          <button type="button" className="btn btn-link text-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
            Back
          </button>
          <h1 className="page-title" style={{ marginTop: 6 }}>
            {paper.courseName}
          </h1>
          <p className="page-subtitle">
            {paper.courseCode} &middot; {paper.paperType} &middot; {paper.semester} &middot; {paper.year}
          </p>
        </div>
        <div className="page-actions">
          <StatusBadge status={paper.status} />
          <button type="button" className="btn btn-secondary" onClick={handleOpen} disabled={busy}>
            <ExternalLink size={15} />
            View PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={busy}>
            {busy ? <span className="btn-spinner" aria-hidden="true" /> : <Download size={15} />}
            Download PDF
          </button>
        </div>
      </header>

      {!isApproved && (
        <div className={'alert ' + (paper.status === 'rejected' ? 'alert-danger' : 'alert-warning')}>
          <Info size={15} aria-hidden="true" />
          <span>
            {paper.status === 'pending' && 'This paper is awaiting administrator approval. It is not visible in search results yet.'}
            {paper.status === 'rejected' && 'This paper was rejected. Reason: ' + (paper.rejectionReason || 'not provided.')}
            {paper.status === 'removed' && 'This paper has been removed from the repository by an administrator.'}
          </span>
        </div>
      )}

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Paper Details</h2>
            <p className="card-subtitle">Full metadata recorded for this examination paper</p>
          </div>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="detail-item">
                <p className="detail-label">{label}</p>
                <p className="detail-value">
                  <Icon size={13} aria-hidden="true" />
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Document Preview</h2>
            <p className="card-subtitle">{paper.downloadFilename}</p>
          </div>
          <Link to="/dashboard/search" className="btn btn-link text-sm">
            Back to search
          </Link>
        </div>
        <div className="card-body">
          <PdfPreview paperId={id} title={paper.courseName + ' - ' + paper.paperType + ' ' + paper.year} />
        </div>
      </section>
    </>
  );
}
