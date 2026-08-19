/**
 * Public repository browser
 * Anyone can see *what* the repository holds - course, code, program, semester,
 * year, type and college - but previewing or downloading a PDF requires a
 * verified account. That rule is enforced by the API, not by this page: the
 * public endpoint simply never returns a file link or an uploader name.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchX, Lock } from 'lucide-react';
import SearchFilters, { EMPTY_FILTERS } from '../../components/SearchFilters';
import Pagination from '../../components/Pagination';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import useCatalogOptions from '../../hooks/useCatalogOptions';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, truncate } from '../../utils/format';

export default function PublicSearchPage() {
  const { isAuthenticated } = useAuth();
  const { options } = useCatalogOptions();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedQ = useDebouncedValue(filters.q, 350);
  const debouncedCourseName = useDebouncedValue(filters.courseName, 350);
  const debouncedCourseCode = useDebouncedValue(filters.courseCode, 350);

  const query = useMemo(
    () => ({
      q: debouncedQ,
      courseName: debouncedCourseName,
      courseCode: debouncedCourseCode,
      semester: filters.semester,
      year: filters.year,
      paperType: filters.paperType,
      program: filters.program,
      college: filters.college,
    }),
    [
      debouncedQ,
      debouncedCourseName,
      debouncedCourseCode,
      filters.semester,
      filters.year,
      filters.paperType,
      filters.program,
      filters.college,
    ]
  );

  useEffect(() => setPage(1), [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = Object.fromEntries(
      Object.entries({ ...query, page, limit: 10 }).filter(([, value]) => value !== '' && value != null)
    );

    api
      .get('/public/papers', { params })
      .then((response) => {
        if (cancelled) return;
        setResults(response.data);
        setMeta(response.meta);
      })
      .catch((apiError) => {
        if (!cancelled) setError(apiError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, page]);

  return (
    <section className="section">
      <div className="container stack gap-4">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
          options={options}
          subtitle="Browse the approved past paper repository. Sign in to preview or download a paper."
        />

        {!isAuthenticated && (
          <div className="alert alert-info">
            <Lock size={15} aria-hidden="true" />
            <span>
              You are browsing as a guest. <Link to="/login">Sign in</Link> or{' '}
              <Link to="/register">register an account</Link> to preview and download these past papers.
            </span>
          </div>
        )}

        <div className="card">
          <div className="results-summary">
            <span>
              {loading
                ? 'Searching the repository...'
                : meta && meta.total > 0
                  ? (
                    <>
                      Showing <strong>{meta.total}</strong> approved past paper{meta.total === 1 ? '' : 's'}
                    </>
                  )
                  : 'No matching approved past papers'}
            </span>
            <span className="results-note">Approved papers verified by QAU PPMS Admin</span>
          </div>

          {loading && <TableSkeleton rows={4} columns={6} />}

          {!loading && error && <ErrorState message={error} />}

          {!loading && !error && results.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No matching papers found."
              message="Try a different keyword, or clear the filters to see the whole repository."
              action={
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Reset filters
                </button>
              }
            />
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Course Name</th>
                      <th scope="col">Code</th>
                      <th scope="col">Program</th>
                      <th scope="col">Semester</th>
                      <th scope="col">Year</th>
                      <th scope="col">Type</th>
                      <th scope="col">College</th>
                      <th scope="col">Date</th>
                      <th scope="col" className="cell-actions">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((paper) => (
                      <tr key={paper._id}>
                        <td className="cell-primary">{paper.courseName}</td>
                        <td className="cell-code">{paper.courseCode}</td>
                        <td className="cell-muted">{paper.programName}</td>
                        <td className="cell-muted">{paper.semester}</td>
                        <td className="cell-muted">{paper.year}</td>
                        <td>
                          <span className="type-chip">{paper.paperType}</span>
                        </td>
                        <td className="cell-muted" title={paper.collegeName}>
                          <span className="table-truncate">{truncate(paper.collegeName, 26)}</span>
                        </td>
                        <td className="cell-muted">{formatDate(paper.createdAt)}</td>
                        <td className="cell-actions">
                          {isAuthenticated ? (
                            <Link to={'/dashboard/paper/' + paper._id} className="btn btn-primary btn-sm">
                              Open
                            </Link>
                          ) : (
                            <Link to="/login" className="btn btn-secondary btn-sm">
                              <Lock size={12} />
                              Sign in
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination meta={meta} onPageChange={setPage} itemLabel="papers" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
