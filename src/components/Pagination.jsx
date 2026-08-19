/**
 * Pagination control driven by the `meta` block every list endpoint returns.
 * Renders nothing when there is only one page.
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Page numbers around the current page, with ellipses for long ranges. */
function pageWindow(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push('...');
  for (let index = start; index <= end; index += 1) pages.push(index);
  if (end < totalPages - 1) pages.push('...');
  pages.push(totalPages);

  return pages;
}

export default function Pagination({ meta, onPageChange, itemLabel = 'results' }) {
  if (!meta || meta.total === 0) return null;

  const { page, limit, total, totalPages, hasPrevPage, hasNextPage } = meta;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="pagination-info">
        Showing <strong>{first}</strong>-<strong>{last}</strong> of <strong>{total}</strong> {itemLabel}
      </p>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-page"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          {pageWindow(page, totalPages).map((entry, index) =>
            entry === '...' ? (
              <span key={'gap-' + index} className="text-muted text-sm" aria-hidden="true">
                ...
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                className="pagination-page"
                aria-current={entry === page ? 'page' : undefined}
                aria-label={'Page ' + entry}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </button>
            )
          )}

          <button
            type="button"
            className="pagination-page"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </nav>
  );
}
