/**
 * Download History 
 * Every successful download writes a row here. "Download Again" performs a real
 * download of the same PDF; if the administrator has since removed the paper
 * the action is disabled and the row explains why.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, DownloadCloud } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { EmptyState, ErrorState, TableSkeleton } from '../../components/States';
import { userApi, downloadPaperFile } from '../../services/ppms.service';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';

export default function DownloadHistoryPage() {
  const toast = useToast();

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
      .getDownloads({ page, limit: 10 })
      .then((response) => {
        setItems(response.data);
        setMeta(response.meta);
      })
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const downloadAgain = async (record) => {
    setBusyId(record.id);
    try {
      await downloadPaperFile(record.paperId);
      toast.success('Download started for ' + record.courseName + '.');
      // A repeat download is itself a new history entry.
      load();
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
          <h1 className="page-title">Download History</h1>
          <p className="page-subtitle">View past papers you have previously downloaded from PaperHub repository</p>
        </div>
        <div className="page-actions">
          <Link to="/dashboard/search" className="btn btn-primary">
            <FileText size={15} />
            Browse All Papers
          </Link>
        </div>
      </header>

      <section className="card">
        {loading && <TableSkeleton rows={4} columns={4} />}

        {!loading && error && <ErrorState title="Unable to load your downloads" message={error} onRetry={load} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={DownloadCloud}
            title="No downloads yet."
            message="Papers you download from the repository will be listed here so you can find them again."
            action={
              <Link to="/dashboard/search" className="btn btn-primary btn-sm">
                Search papers
              </Link>
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
                    <th scope="col">Downloaded Date</th>
                    <th scope="col" className="cell-actions">Download Again</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((record) => (
                    <tr key={record.id}>
                      <td className="cell-primary">{record.courseName}</td>
                      <td className="cell-code">{record.courseCode}</td>
                      <td className="cell-muted">{formatDateTime(record.downloadedAt)}</td>
                      <td className="cell-actions">
                        {record.stillAvailable ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => downloadAgain(record)}
                            disabled={busyId === record.id}
                          >
                            {busyId === record.id ? (
                              <span className="btn-spinner" aria-hidden="true" />
                            ) : (
                              <Download size={13} />
                            )}
                            Download Again
                          </button>
                        ) : (
                          <span className="badge badge-removed">No longer available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination meta={meta} onPageChange={setPage} itemLabel="downloads" />
          </>
        )}
      </section>
    </>
  );
}
