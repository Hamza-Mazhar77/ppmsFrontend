/**
 * Student dashboard 
 * Title and welcome line, two quick actions, four statistic cards, then the
 * "My Recent Uploads" table. Every number and every row comes from
 * GET /api/users/me/stats, so uploading a paper, downloading one, or having an
 * upload approved all change this screen without any code involvement.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Download, Clock, CheckCircle2, Eye, FileStack } from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import { userApi, openPaperInNewTab } from '../../services/ppms.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return userApi
      .getStats()
      .then((response) => setData(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, []);

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

  const stats = data?.stats;
  const recent = data?.recentUploads || [];

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Student Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.fullName}</strong> ({user?.collegeName})
          </p>
        </div>
        <div className="page-actions">
          <Link to="/dashboard/upload" className="btn btn-primary">
            <Upload size={15} />
            Upload New Paper
          </Link>
          <Link to="/dashboard/search" className="btn btn-secondary">
            <Search size={15} />
            Search Repository
          </Link>
        </div>
      </header>

      <section className="stat-grid" aria-label="Your activity summary">
        <StatCard
          label="Uploaded Papers"
          value={stats?.uploaded ?? 0}
          caption="Total contributions"
          icon={Upload}
          tone="blue"
          loading={loading}
        />
        <StatCard
          label="Downloaded Papers"
          value={stats?.downloaded ?? 0}
          caption="Saved to history"
          icon={Download}
          tone="slate"
          loading={loading}
        />
        <StatCard
          label="Pending Papers"
          value={stats?.pending ?? 0}
          caption="Awaiting admin review"
          icon={Clock}
          tone="amber"
          loading={loading}
        />
        <StatCard
          label="Approved Papers"
          value={stats?.approved ?? 0}
          caption="Published online"
          icon={CheckCircle2}
          tone="green"
          loading={loading}
        />
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">My Recent Uploads</h2>
            <p className="card-subtitle">Track status and approval of examination papers submitted by you</p>
          </div>
          <Link to="/dashboard/upload-history" className="btn btn-link text-sm">
            View All
          </Link>
        </div>

        {loading && <TableSkeleton rows={4} columns={6} />}

        {!loading && error && <ErrorState title="Unable to load your dashboard" message={error} onRetry={load} />}

        {!loading && !error && recent.length === 0 && (
          <EmptyState
            icon={FileStack}
            title="No uploads yet."
            message="Upload your first past paper to help other students prepare for their examinations."
            action={
              <Link to="/dashboard/upload" className="btn btn-primary btn-sm">
                <Upload size={14} />
                Upload a paper
              </Link>
            }
          />
        )}

        {!loading && !error && recent.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Course Name</th>
                  <th scope="col">Code</th>
                  <th scope="col">Semester</th>
                  <th scope="col">Year</th>
                  <th scope="col">Paper Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Upload Date</th>
                  <th scope="col" className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((paper) => (
                  <tr key={paper._id}>
                    <td className="cell-primary">{paper.courseName}</td>
                    <td className="cell-code">{paper.courseCode}</td>
                    <td className="cell-muted">{paper.semester}</td>
                    <td className="cell-muted">{paper.year}</td>
                    <td>
                      <span className="type-chip">{paper.paperType}</span>
                    </td>
                    <td>
                      <StatusBadge
                        status={paper.status}
                        label={paper.status === 'pending' ? 'Pending Review' : undefined}
                      />
                    </td>
                    <td className="cell-muted">{formatDate(paper.createdAt)}</td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => preview(paper._id)}
                        disabled={busyId === paper._id}
                        aria-label={'Preview ' + paper.courseName}
                      >
                        <Eye size={13} />
                      </button>
                      <Link to={'/dashboard/paper/' + paper._id} className="btn btn-link text-sm">
                        Details
                      </Link>
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
