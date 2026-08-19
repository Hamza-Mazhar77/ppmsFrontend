/**
 * Manage Users 
 * Directory of every account with search and role/status filters, plus the two
 * administrative actions: suspend/reinstate and delete. The server refuses to
 * suspend or delete the last remaining administrator, and this screen also
 * hides those actions on the signed-in administrator's own row.
 */
import { useCallback, useEffect, useState } from 'react';
import { Search, Users, UserX, UserCheck, Trash2, ShieldCheck } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { ConfirmDialog } from '../../components/Modal';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { adminApi } from '../../services/ppms.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, truncate } from '../../utils/format';

const ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: 'student', label: 'Students' },
  { value: 'admin', label: 'Administrators' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'unverified', label: 'Unverified' },
];

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [suspendTarget, setSuspendTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => setPage(1), [debouncedSearch, role, status]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');

    const params = { page, limit: 10, role, status };
    if (debouncedSearch) params.q = debouncedSearch;

    return adminApi
      .getUsers(params)
      .then((response) => {
        setItems(response.data);
        setMeta(response.meta);
      })
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, [page, role, status, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSuspension = async () => {
    const target = suspendTarget;
    setBusyId(target.id);
    try {
      const response = await adminApi.setSuspension(target.id, !target.isSuspended);
      toast.success(response.message);
      setSuspendTarget(null);
      await load();
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async () => {
    setBusyId(deleteTarget.id);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      toast.success('User and all associated records deleted.');
      setDeleteTarget(null);
      await load();
    } catch (apiError) {
      toast.error(apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">
              <Users size={17} style={{ verticalAlign: '-3px', marginRight: 6, color: 'var(--primary)' }} aria-hidden="true" />
              Manage Users
            </h1>
            <p className="card-subtitle">View, suspend or remove accounts registered on PPMS</p>
          </div>
          <span className="badge badge-info">{meta?.total ?? 0} Registered Accounts</span>
        </div>
      </section>

      <section className="card">
        <div className="tab-row">
          <div className="row gap-2 wrap">
            <select
              className="form-control"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-label="Filter by role"
              style={{ width: 'auto' }}
            >
              {ROLE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
              style={{ width: 'auto' }}
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="tab-search">
            <Search size={14} aria-hidden="true" />
            <input
              type="search"
              className="form-control"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone or college..."
              aria-label="Search users"
            />
          </div>
        </div>

        {loading && <TableSkeleton rows={5} columns={8} />}

        {!loading && error && <ErrorState title="Unable to load users" message={error} onRetry={load} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={Users}
            title="No users found."
            message="No account matches the current search and filters."
          />
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">College</th>
                    <th scope="col">Program</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                    <th scope="col" className="cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const isSelf = row.id === currentUser?.id;
                    return (
                      <tr key={row.id}>
                        <td className="cell-primary">
                          {row.fullName}
                          {isSelf && (
                            <span className="badge badge-neutral" style={{ marginLeft: 8 }}>
                              You
                            </span>
                          )}
                        </td>
                        <td className="cell-muted">{row.email || '-'}</td>
                        <td className="cell-muted">{row.phone || '-'}</td>
                        <td className="cell-muted" title={row.collegeName}>
                          <span className="table-truncate">{truncate(row.collegeName || '-', 24)}</span>
                        </td>
                        <td className="cell-muted" title={row.programName}>
                          <span className="table-truncate">{truncate(row.programName || '-', 20)}</span>
                        </td>
                        <td>
                          <span className={'badge ' + (row.role === 'admin' ? 'badge-info' : 'badge-neutral')}>
                            {row.role === 'admin' && <ShieldCheck size={11} aria-hidden="true" />}
                            {row.role === 'admin' ? 'Admin' : 'Student'}
                          </span>
                        </td>
                        <td>
                          {row.isSuspended ? (
                            <span className="badge badge-rejected">Suspended</span>
                          ) : row.isVerified ? (
                            <span className="badge badge-approved">Active</span>
                          ) : (
                            <span className="badge badge-pending">Unverified</span>
                          )}
                        </td>
                        <td className="cell-muted">{formatDate(row.createdAt)}</td>
                        <td className="cell-actions">
                          {isSelf ? (
                            <span className="text-xs text-muted">-</span>
                          ) : (
                            <>
                              <button
                                type="button"
                                className={'btn btn-sm ' + (row.isSuspended ? 'btn-success' : 'btn-secondary')}
                                onClick={() => setSuspendTarget(row)}
                                disabled={busyId === row.id}
                              >
                                {row.isSuspended ? <UserCheck size={13} /> : <UserX size={13} />}
                                {row.isSuspended ? 'Reinstate' : 'Suspend'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setDeleteTarget(row)}
                                disabled={busyId === row.id}
                                aria-label={'Delete ' + row.fullName}
                                title="Delete account"
                              >
                                <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination meta={meta} onPageChange={setPage} itemLabel="users" />
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(suspendTarget)}
        title={suspendTarget?.isSuspended ? 'Reinstate this account?' : 'Suspend this account?'}
        message={
          suspendTarget
            ? suspendTarget.isSuspended
              ? suspendTarget.fullName + ' will be able to sign in and use PPMS again.'
              : suspendTarget.fullName + ' will be signed out immediately and blocked from signing in until reinstated. Their uploaded papers are not deleted.'
            : ''
        }
        confirmLabel={suspendTarget?.isSuspended ? 'Reinstate user' : 'Suspend user'}
        variant={suspendTarget?.isSuspended ? 'success' : 'danger'}
        busy={busyId === suspendTarget?.id}
        onClose={() => setSuspendTarget(null)}
        onConfirm={toggleSuspension}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this account permanently?"
        message={
          deleteTarget
            ? 'This permanently deletes ' + deleteTarget.fullName + ', every paper they uploaded (including the stored PDFs) and their download history. This cannot be undone.'
            : ''
        }
        confirmLabel="Delete account"
        busy={busyId === deleteTarget?.id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteUser}
      />
    </>
  );
}
