'use client';

export default function Pagination({ page, pageSize, total, hasNext, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNextPage = hasNext !== undefined ? hasNext : page < totalPages;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
        {total > 0 ? (
          <>
            Showing{' '}
            <strong style={{ color: 'var(--color-text)' }}>
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
            </strong>{' '}
            of <strong style={{ color: 'var(--color-text)' }}>{total}</strong> results
          </>
        ) : (
          'No results'
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          ← Previous
        </button>

        <span
          style={{
            fontSize: 13,
            color: 'var(--color-text-muted)',
            padding: '0 8px',
            whiteSpace: 'nowrap',
          }}
        >
          Page <strong style={{ color: 'var(--color-text)' }}>{page}</strong> of{' '}
          <strong style={{ color: 'var(--color-text)' }}>{totalPages}</strong>
        </span>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
