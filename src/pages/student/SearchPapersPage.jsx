/**
 * Search & Results 
 * The keyword box is debounced and every filter triggers a fresh server-side
 * query, so the client never holds more than one page of results. Only papers
 * an administrator has approved are ever returned by the API.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, SearchX, ShieldCheck } from 'lucide-react';
import SearchFilters, { EMPTY_FILTERS } from '../../components/SearchFilters';
import Pagination from '../../components/Pagination';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import useCatalogOptions from '../../hooks/useCatalogOptions';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { paperApi, downloadPaperFile, openPaperInNewTab } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { formatDate, truncate } from '../../utils/format';

export default function SearchPapersPage() {
  const toast = useToast();
  const { options } = useCatalogOptions();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Only the free-text fields need debouncing; the selects apply immediately.
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

  // Any change to the criteria puts the user back on page one.
  useEffect(() => setPage(1), [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    // Strip empty values so the request URL stays clean.
    const params = Object.fromEntries(Object.entries({ ...query, page, limit: 10 }).filter(([, value]) => value !== '' && value != null));

    paperApi
      .search(params)
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

  const handlePreview = useCallback(
    async (paperId) => {
      setBusyId(paperId);
      try {
        await openPaperInNewTab(paperId);
      } catch (apiError) {
        toast.error(apiError.message);
      } finally {
        setBusyId(null);
      }
    },
    [toast]
  );

  const handleDownload = useCallback(
    async (paper) => {
      setBusyId(paper._id);
      try {
        await downloadPaperFile(paper._id);
        toast.success('Download started for ' + paper.courseName + '.');
      } catch (apiError) {
        toast.error(apiError.message);
      } finally {
        setBusyId(null);
      }
    },
    [toast]
  );

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <>
      <SearchFilters filters={filters} onChange={setFilters} onReset={resetFilters} options={options} />

      <section className="card">
        <div className="results-summary">
          <span>
            {loading
              ? 'Searching the repository...'
              : meta && meta.total > 0
                ? (
                  <>
                    Showing <strong>{meta.total}</strong> matching approved past paper{meta.total === 1 ? '' : 's'}
                  </>
                )
                : 'No matching approved past papers'}
          </span>
          <span className="results-note">
            <ShieldCheck size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} aria-hidden="true" />
            Showing approved papers verified by QAU PPMS Admin
          </span>
        </div>

        {loading && <TableSkeleton rows={4} columns={7} />}

        {!loading && error && <ErrorState message={error} onRetry={() => setPage((current) => current)} />}

        {!loading && !error && results.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="No matching papers found."
            message="Try a different keyword, or clear the filters to see everything in the repository."
            action={
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
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
                    <th scope="col">Uploaded By</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((paper) => (
                    <tr key={paper._id}>
                      <td className="cell-primary">
                        <Link to={'/dashboard/paper/' + paper._id}>{paper.courseName}</Link>
                      </td>
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
                      <td className="cell-muted">{paper.uploaderName}</td>
                      <td className="cell-muted">{formatDate(paper.createdAt)}</td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handlePreview(paper._id)}
                          disabled={busyId === paper._id}
                        >
                          <Eye size={13} />
                          Preview
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownload(paper)}
                          disabled={busyId === paper._id}
                        >
                          {busyId === paper._id ? <span className="btn-spinner" aria-hidden="true" /> : <Download size={13} />}
                          Download
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
    </>
  );
}
