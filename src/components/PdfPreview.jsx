/**
 * In-browser PDF viewer
 * Requests a short lived, paper-scoped access token from the API and points an
 * <iframe> at the streaming endpoint, so the real stored PDF is rendered by the
 * browser's native viewer. The storage URL is never exposed to the client.
 */
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { buildPaperFileUrl, openPaperInNewTab } from '../services/ppms.service';
import { LoadingState, ErrorState } from './States';

export default function PdfPreview({ paperId, title = 'Past paper preview', className = 'pdf-frame' }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    buildPaperFileUrl(paperId, 'view')
      .then((authorisedUrl) => {
        if (!cancelled) setUrl(authorisedUrl);
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
  }, [paperId]);

  if (loading) return <LoadingState label="Preparing the PDF preview..." />;
  if (error) return <ErrorState title="Preview unavailable" message={error} />;

  return (
    <div className="stack gap-3">
      <iframe src={url} title={title} className={className} />
      <div className="row-between wrap gap-2">
        <p className="text-xs text-muted">
          If the preview does not render in your browser, open the file in a new tab.
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => openPaperInNewTab(paperId)}
        >
          <ExternalLink size={13} />
          Open in new tab
        </button>
      </div>
    </div>
  );
}
