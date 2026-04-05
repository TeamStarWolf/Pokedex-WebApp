type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
};

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  const pageNumbers = getPageNumbers(page, totalPages);
  const rangeStart = totalItems && pageSize ? (page - 1) * pageSize + 1 : null;
  const rangeEnd = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div className="pagination">
      {totalItems != null && rangeStart != null && rangeEnd != null ? (
        <span className="pagination-info">
          Showing {rangeStart}–{rangeEnd} of {totalItems}
        </span>
      ) : null}
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <div className="pagination-pages">
        {pageNumbers.map((entry, index) =>
          entry === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={entry}
              type="button"
              className={entry === page ? "active-page" : ""}
              onClick={() => onChange(entry)}
            >
              {entry}
            </button>
          ),
        )}
      </div>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}
