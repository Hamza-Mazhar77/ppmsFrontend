/**
 * Manage Papers 
 * Status tabs with live counts, a search box, and the full repository table
 * with Review / Approve / Reject / Delete actions. The status tab is kept in
 * the URL (?status=pending) so the admin dashboard can link straight into the
 * review queue and the browser Back button behaves sensibly.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileCheck2, Search, Eye, Check, XCircle, Trash2, FileX } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import RejectPaperDialog from '../../components/RejectPaperDialog';
import { ConfirmDialog } from '../../components/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { adminApi } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { formatDate, truncate } from '../../utils/format';

const TABS = [
  { value: 'all', label: 'All', countKey: 'all' },
  { value: 'pending', label: 'Pending', countKey: 'pending' },
  { value: 'approved', label: 'Approved', countKey: 'approved' },
  { value: 'rejected', label: 'Rejected', countKey: 'rejected' },
  { value: 'removed', label: 'Removed', countKey: 'removed' },
];

export default function ManagePapersPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || 'all';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  // Reset to the first page whenever the criteria change.
  useEffect(() => setPage(1), [status, debouncedSearch]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');

    const params = { page, limit: 10, status };
    if (debouncedSearch) params.q = debouncedSearch;

    return adminApi
      .getPapers(params)
      .then((response) => {
        setItems(response.data);
        setMeta(response.meta);
      })
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = meta?.counts;
  const pendingCount = counts?.pending ?? 0;

  const setStatus = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('status');
    else params.set('status', next);
    setSearchParams(params, { replace: true });
  };

  const approve = async (paper) => {
    setBusyId(paper._id);
    try {
      await adminApi.approvePaper(paper._id);
      toast.success('Paper approved and published.');
      await load();
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (reason) => {
    setBusyId(rejectTarget._id);
    try {
      await adminApi.rejectPaper(rejectTarget._id, reason);
      toast.success('Paper rejected.');
      setRejectTarget(null);
      await load();
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    setBusyId(deleteTarget._id);
    try {
      // `purge` permanently deletes the record and its stored file; used for
      // duplicates and anything that should leave no trace in the repository.
      await adminApi.deletePaper(deleteTarget._id, true);
      toast.success('Paper deleted from the repository.');
      setDeleteTarget(null);
      await load();
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  const tabsWithCounts = useMemo(
    () => TABS.map((tab) => ({ ...tab, count: counts ? counts[tab.countKey] : null })),
    [counts]
  );

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">
              <FileCheck2 size={17} style={{ verticalAlign: '-3px', marginRight: 6, color: 'var(--primary)' }} aria-hidden="true" />
              Manage Papers
            </h1>
            <p className="card-subtitle">
              Review, approve, reject or delete examination papers uploaded across affiliated colleges
            </p>
          </div>
          <span className={'badge ' + (pendingCount > 0 ? 'badge-pending' : 'badge-neutral')}>
            {pendingCount} Pending Review
          </span>
        </div>
      </section>

      <section className="card">
        <div className="tab-row">
          <div className="tab-list" role="tablist" aria-label="Filter papers by status">
            {tabsWithCounts.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                className={'tab' + (status === tab.value ? ' active' : '')}
                onClick={() => setStatus(tab.value)}
              >
                {tab.label}
                {tab.count != null ? ' (' + tab.count + ')' : ''}
              </button>
            ))}
          </div>

          <div className="tab-search">
            <Search size={14} aria-hidden="true" />
            <input
              type="search"
              className="form-control"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search course, code, uploader..."
              aria-label="Search papers"
            />
          </div>
        </div>

        {loading && <TableSkeleton rows={5} columns={8} />}

        {!loading && error && <ErrorState title="Unable to load papers" message={error} onRetry={load} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={FileX}
            title="No papers found."
            message={
              search
                ? 'No paper matches that search in this status. Try a different term or another tab.'
                : 'There are no papers with this status yet.'
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
                    <th scope="col">Uploader</th>
                    <th scope="col">Program</th>
                    <th scope="col">Semester</th>
                    <th scope="col">Year</th>
                    <th scope="col">Status</th>
                    <th scope="col">Upload Date</th>
                    <th scope="col" className="cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((paper) => (
                    <tr key={paper._id}>
                      <td className="cell-primary">
                        <Link to={'/admin/papers/' + paper._id}>{paper.courseName}</Link>
                        {paper.isDuplicateSuspected && (
                          <span className="badge badge-pending" style={{ marginLeft: 8 }}>
                            Duplicate?
                          </span>
                        )}
                      </td>
                      <td className="cell-code">{paper.courseCode}</td>
                      <td className="cell-muted">{paper.uploaderName}</td>
                      <td className="cell-muted" title={paper.programName}>
                        <span className="table-truncate">{truncate(paper.programName, 20)}</span>
                      </td>
                      <td className="cell-muted">{paper.semester}</td>
                      <td className="cell-muted">{paper.year}</td>
                      <td>
                        <StatusBadge status={paper.status} />
                      </td>
                      <td className="cell-muted">{formatDate(paper.createdAt)}</td>
                      <td className="cell-actions">
                        <Link to={'/admin/papers/' + paper._id} className="btn btn-ghost btn-sm">
                          <Eye size={13} />
                          Review
                        </Link>

                        {paper.status !== 'approved' && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => approve(paper)}
                            disabled={busyId === paper._id}
                          >
                            <Check size={13} />
                            Approve
                          </button>
                        )}

                        {paper.status !== 'rejected' && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setRejectTarget(paper)}
                            disabled={busyId === paper._id}
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(paper)}
                          disabled={busyId === paper._id}
                          aria-label={'Delete ' + paper.courseName}
                          title="Delete permanently"
                        >
                          <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination meta={meta} onPageChange={setPage} itemLabel="papers" />
          </>
        )}
      </section>

      <RejectPaperDialog
        open={Boolean(rejectTarget)}
        paper={rejectTarget}
        busy={busyId === rejectTarget?._id}
        onClose={() => setRejectTarget(null)}
        onConfirm={reject}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this paper permanently?"
        message={
          deleteTarget
            ? 'This removes "' + deleteTarget.courseName + ' (' + deleteTarget.courseCode + ')" and its stored PDF from the repository. This cannot be undone.'
            : ''
        }
        confirmLabel="Delete permanently"
        busy={busyId === deleteTarget?._id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
}
