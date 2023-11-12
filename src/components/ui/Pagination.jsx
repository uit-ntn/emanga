import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

function range(page, total) {
  const delta = 1;
  const pages = new Set([1, total, page]);
  for (let i = 1; i <= delta; i += 1) {
    pages.add(page - i);
    pages.add(page + i);
  }
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…' + p);
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null;
  const btn =
    'grid h-10 min-w-[2.5rem] place-items-center rounded-xl px-3 text-sm font-medium transition disabled:opacity-40 disabled:pointer-events-none';
  return (
    <nav className={clsx('flex flex-wrap items-center justify-center gap-1', className)} aria-label="Phân trang">
      <button
        type="button"
        className={clsx(btn, 'hover:bg-zinc-200 dark:hover:bg-zinc-800')}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {range(page, totalPages).map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="px-1 text-zinc-400">
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={clsx(
              btn,
              p === page ? 'bg-brand-600 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className={clsx(btn, 'hover:bg-zinc-200 dark:hover:bg-zinc-800')}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
