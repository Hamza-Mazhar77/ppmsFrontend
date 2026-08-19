/**
 * Admin overview 
 * Dark navy banner with the orange shield mark and a "Review Pending Queue"
 * action, four outlined statistic cards, then the immediate pending moderation
 * queue with Review Paper / Approve actions. All counts come from
 * GET /api/admin/dashboard.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  Check,
  Inbox,
  AlertTriangle,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import { adminApi } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

export default function AdminDashboardPage() {
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return adminApi
      .getDashboard()
      .then((response) => setData(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const stats = data?.stats;
  const queue = data?.pendingQueue || [];

  return (
    <>
      <section className="admin-banner">
        <div className="admin-banner-left">
          <span className="admin-banner-mark" aria-hidden="true">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h1 className="admin-banner-title">PPMS Admin Overview Dashboard</h1>
            <p className="admin-banner-sub">Quaid-i-Azam University Islamabad - Central Moderation System</p>
          </div>
        </div>
        <Link to="/admin/papers?status=pending" className="btn btn-warning">
          <Clock size={15} />
          Review Pending Queue ({stats?.pending ?? 0})
        </Link>
      </section>

      <section className="stat-grid" aria-label="Repository statistics">
        <StatCard
          label="Pending Papers"
          value={stats?.pending ?? 0}
          icon={Clock}
          tone="amber"
          uppercaseLabel
          outlined
          loading={loading}
          badge={{ label: 'Requires Review', className: 'badge-pending' }}
          linkTo="/admin/papers?status=pending"
          linkLabel="View review queue"
        />
        <StatCard
          label="Approved Papers"
          value={stats?.approved ?? 0}
          icon={CheckCircle2}
          tone="green"
          uppercaseLabel
          outlined
          loading={loading}
          badge={{ label: 'Published', className: 'badge-approved' }}
          linkTo="/admin/papers?status=approved"
          linkLabel="Manage approved repository"
        />
        <StatCard
          label="Rejected Papers"
          value={stats?.rejected ?? 0}
          icon={XCircle}
          tone="red"
          uppercaseLabel
          outlined
          loading={loading}
          badge={{ label: 'Declined', className: 'badge-rejected' }}
          linkTo="/admin/papers?status=rejected"
          linkLabel="View rejected logs"
        />
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          tone="blue"
          uppercaseLabel
          outlined
          loading={loading}
          badge={{ label: 'Registered Accounts', className: 'badge-info' }}
          linkTo="/admin/users"
          linkLabel="Manage student accounts"
        />
      </section>

      {!loading && stats?.flaggedDuplicates > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>
            {stats.flaggedDuplicates} pending submission{stats.flaggedDuplicates === 1 ? ' is' : 's are'} flagged as a
            possible duplicate. Open the review screen to compare them with the existing paper.
          </span>
        </div>
      )}

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Clock size={16} style={{ verticalAlign: '-3px', marginRight: 6, color: 'var(--warning-text)' }} aria-hidden="true" />
              Immediate Pending Moderation Queue
            </h2>
            <p className="card-subtitle">Papers submitted by affiliated college students requiring admin verification</p>
          </div>
          <Link to="/admin/papers?status=pending" className="btn btn-link text-sm">
            View All ({stats?.pending ?? 0})
          </Link>
        </div>

        {loading && <TableSkeleton rows={4} columns={6} />}

        {!loading && error && <ErrorState title="Unable to load the dashboard" message={error} onRetry={load} />}

        {!loading && !error && queue.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No pending papers."
            message="Every submission has been reviewed. New uploads will appear here automatically."
          />
        )}

        {!loading && !error && queue.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Course Name</th>
                  <th scope="col">Code</th>
                  <th scope="col">Uploader</th>
                  <th scope="col">Semester / Year</th>
                  <th scope="col">Upload Date</th>
                  <th scope="col" className="cell-actions">Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((paper) => (
                  <tr key={paper._id}>
                    <td className="cell-primary">
                      {paper.courseName}
                      {paper.isDuplicateSuspected && (
                        <span className="badge badge-pending" style={{ marginLeft: 8 }}>
                          Possible duplicate
                        </span>
                      )}
                    </td>
                    <td className="cell-code">{paper.courseCode}</td>
                    <td className="cell-muted">{paper.uploaderName}</td>
                    <td className="cell-muted">
                      {paper.semester} ({paper.year})
                    </td>
                    <td className="cell-muted">{formatDate(paper.createdAt)}</td>
                    <td className="cell-actions">
                      <Link to={'/admin/papers/' + paper._id} className="btn btn-ghost btn-sm">
                        <Eye size={13} />
                        Review Paper
                      </Link>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => approve(paper)}
                        disabled={busyId === paper._id}
                      >
                        {busyId === paper._id ? <span className="btn-spinner" aria-hidden="true" /> : <Check size={13} />}
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
