/**
 * Upload History 
 * Lists only the signed-in student's own uploads (the API scopes the query to
 * the JWT holder), with the moderation status of each and, for anything that
 * was rejected, the administrator's reason.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Eye, FileStack, Info } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import { userApi, openPaperInNewTab } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function UploadHistoryPage() {
  const toast = useToast();

  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return userApi
      .getUploads({ page, limit: 10, status })
      .then((response) => {
        setItems(response.data);
        setMeta(response.meta);
      })
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const preview = async (paperId) => {
    setBusyId(paperId);
    try {
      await openPaperInNewTab(paperId);
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Upload History</h1>
          <p className="page-subtitle">Track status of all past papers uploaded by you to PPMS</p>
        </div>
        <div className="page-actions">
          <Link to="/dashboard/upload" className="btn btn-primary">
            <Upload size={15} />
            Upload New Paper
          </Link>
        </div>
      </header>

      <section className="card">
        <div className="tab-row">
          <div className="tab-list" role="tablist" aria-label="Filter uploads by status">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                className={'tab' + (status === tab.value ? ' active' : '')}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <TableSkeleton rows={5} columns={7} />}

        {!loading && error && <ErrorState title="Unable to load your uploads" message={error} onRetry={load} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={FileStack}
            title={status === 'all' ? 'No uploads yet.' : 'No ' + status + ' uploads.'}
            message={
              status === 'all'
                ? 'Papers you upload will appear here with their review status.'
                : 'Try a different status tab to see your other submissions.'
            }
            action={
              status === 'all' ? (
                <Link to="/dashboard/upload" className="btn btn-primary btn-sm">
                  <Upload size={14} />
                  Upload a paper
                </Link>
              ) : null
            }
          />
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Course Name</th>
                    <th scope="col">Course Code</th>
                    <th scope="col">Year</th>
                    <th scope="col">Semester</th>
                    <th scope="col">Type</th>
                    <th scope="col">Upload Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((paper) => (
                    <tr key={paper._id}>
                      <td className="cell-primary">{paper.courseName}</td>
                      <td className="cell-code">{paper.courseCode}</td>
                      <td className="cell-muted">{paper.year}</td>
                      <td className="cell-muted">{paper.semester}</td>
                      <td>
                        <span className="type-chip">{paper.paperType}</span>
                      </td>
                      <td className="cell-muted">{formatDate(paper.createdAt)}</td>
                      <td>
                        <StatusBadge status={paper.status} />
                        {paper.status === 'rejected' && paper.rejectionReason && (
                          <p className="text-xs" style={{ color: 'var(--danger-text)', marginTop: 4, maxWidth: 220 }}>
                            <Info size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} aria-hidden="true" />
                            {paper.rejectionReason}
                          </p>
                        )}
                        {paper.status === 'pending' && (
                          <p className="text-xs text-muted" style={{ marginTop: 4 }}>
                            Awaiting admin review
                          </p>
                        )}
                      </td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-link text-sm"
                          onClick={() => preview(paper._id)}
                          disabled={busyId === paper._id}
                        >
                          <Eye size={13} />
                          Preview PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination meta={meta} onPageChange={setPage} itemLabel="uploads" />
          </>
        )}
      </section>
    </>
  );
}
