import { FiAlertTriangle, FiInbox, FiRefreshCw } from "react-icons/fi";

/**
 * Shared loading / empty / error blocks.
 *
 * They use the design-system primitives (`.skeleton`, `.surface`) so every
 * page looks the same and both themes work.
 */

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Placeholder for a product card in the grid. */
export function ProductCardSkeleton() {
  return (
    <div className="surface overflow-hidden p-0">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

/** Placeholder rows for a table. */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3 p-5" aria-hidden="true">
      {Array.from({ length: rows }).map((_row, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_column, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={columnIndex === 0 ? "h-4 flex-1" : "h-4 flex-1/4"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Empty state: an icon, one line of copy and one action. */
export function EmptyState({ title, description, action, className = "" }) {
  return (
    <div
      className={`surface flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
        <FiInbox aria-hidden="true" className="size-6" />
      </span>
      <div>
        <p className="text-base font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** Error state with a working retry. */
export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this data. Please try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={`surface flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <FiAlertTriangle aria-hidden="true" className="size-6" />
      </span>
      <div>
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-md text-sm text-ink-muted">{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <FiRefreshCw aria-hidden="true" className="size-4" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
