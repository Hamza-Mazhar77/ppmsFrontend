/**
 * Administrator paper review screen
 * Presents the complete metadata, the duplicate warning (with a link to the
 * paper this one may duplicate), the embedded PDF preview and the Approve /
 * Reject / Delete actions. Rejecting always captures a reason, which is stored
 * on the paper and shown to the student.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  XCircle,
  Trash2,
  BookOpen,
  Hash,
  User,
  Mail,
  GraduationCap,
  Building2,
  Layers,
  CalendarDays,
  FileType2,
  Clock,
  FileText,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import PdfPreview from '../../components/PdfPreview';
import RejectPaperDialog from '../../components/RejectPaperDialog';
import { ConfirmDialog } from '../../components/Modal';
import { LoadingState, ErrorState } from '../../components/States';
import { adminApi } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatFileSize } from '../../utils/format';

export default function ReviewPaperPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return adminApi
      .getPaper(id)
      .then((response) => setPaper(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async () => {
    setBusy(true);
    try {
      await adminApi.approvePaper(id);
      toast.success('Paper approved and published.');
      await load();
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  const reject = async (reason) => {
    setBusy(true);
    try {
      await adminApi.rejectPaper(id, reason);
      toast.success('Paper rejected.');
      setRejectOpen(false);
      await load();
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.deletePaper(id, true);
      toast.success('Paper deleted from the repository.');
      navigate('/admin/papers');
    } catch (apiError) {
      toast.error(apiError.message);
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingState label="Loading the submission..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState title="Unable to load this paper" message={error} onRetry={load} />
        <div className="card-footer">
          <Link to="/admin/papers" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            Back to Manage Papers
          </Link>
        </div>
      </div>
    );
  }

  const uploader = typeof paper.uploader === 'object' ? paper.uploader : null;

  const details = [
    { label: 'Course Name', value: paper.courseName, icon: BookOpen },
    { label: 'Course Code', value: paper.courseCode, icon: Hash },
    { label: 'Paper Type', value: paper.paperType, icon: FileType2 },
    { label: 'Semester', value: paper.semester, icon: Layers },
    { label: 'Year', value: paper.year, icon: CalendarDays },
    { label: 'Degree Program', value: paper.programName, icon: GraduationCap },
    { label: 'College', value: paper.collegeName, icon: Building2 },
    { label: 'Uploaded By', value: paper.uploaderName, icon: User },
    { label: 'Uploader Email', value: uploader?.email || '-', icon: Mail },
    { label: 'Submission Date', value: formatDate(paper.createdAt), icon: Clock },
    { label: 'File', value: paper.fileName + ' (' + formatFileSize(paper.fileSize) + ')', icon: FileText },
    { label: 'Downloads', value: paper.downloadCount, icon: FileText },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <Link to="/admin/papers" className="btn btn-link text-sm">
            <ArrowLeft size={14} />
            Back to Manage Papers
          </Link>
          <h1 className="page-title" style={{ marginTop: 6 }}>
            Review Submission
          </h1>
          <p className="page-subtitle">
            {paper.courseName} ({paper.courseCode}) &middot; submitted by {paper.uploaderName}
          </p>
        </div>
        <div className="page-actions">
          <StatusBadge status={paper.status} />
          {paper.status !== 'approved' && (
            <button type="button" className="btn btn-success" onClick={approve} disabled={busy}>
              {busy ? <span className="btn-spinner" aria-hidden="true" /> : <Check size={15} />}
              Approve
            </button>
          )}
          {paper.status !== 'rejected' && (
            <button type="button" className="btn btn-danger" onClick={() => setRejectOpen(true)} disabled={busy}>
              <XCircle size={15} />
              Reject
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => setDeleteOpen(true)} disabled={busy}>
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </header>

      {paper.isDuplicateSuspected && (
        <div className="alert alert-warning">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>
            <strong>Possible duplicate.</strong> {paper.duplicateReason}
            {paper.duplicateOfPaper && (
              <>
                {' '}
                Existing paper:{' '}
                <Link to={'/admin/papers/' + paper.duplicateOfPaper._id}>
                  {paper.duplicateOfPaper.courseName} ({paper.duplicateOfPaper.courseCode}),{' '}
                  {paper.duplicateOfPaper.paperType} {paper.duplicateOfPaper.year}, uploaded by{' '}
                  {paper.duplicateOfPaper.uploaderName} on {formatDate(paper.duplicateOfPaper.createdAt)}
                </Link>
                .
              </>
            )}
          </span>
        </div>
      )}

      {paper.status === 'rejected' && paper.rejectionReason && (
        <div className="alert alert-danger">
          <XCircle size={15} aria-hidden="true" />
          <span>
            <strong>Rejected on {formatDate(paper.rejectedAt)}.</strong> Reason: {paper.rejectionReason}
          </span>
        </div>
      )}

      {paper.status === 'approved' && (
        <div className="alert alert-success">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>
            Approved on {formatDate(paper.approvedAt)}. This paper is searchable and downloadable by students.
          </span>
        </div>
      )}

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Submission Metadata</h2>
            <p className="card-subtitle">Verify these details against the document before approving</p>
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
            <p className="card-subtitle">Check the scan quality and that the content matches the metadata</p>
          </div>
        </div>
        <div className="card-body">
          <PdfPreview paperId={id} title={'Review: ' + paper.courseName} />
        </div>
      </section>

      <RejectPaperDialog
        open={rejectOpen}
        paper={paper}
        busy={busy}
        onClose={() => setRejectOpen(false)}
        onConfirm={reject}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this paper permanently?"
        message={
          'This removes "' + paper.courseName + ' (' + paper.courseCode + ')" and its stored PDF from the repository. This cannot be undone.'
        }
        confirmLabel="Delete permanently"
        busy={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
      />
    </>
  );
}
