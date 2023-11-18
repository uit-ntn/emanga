import clsx from 'clsx';
import MangaCard, { MangaCardSkeleton } from './MangaCard';

const BASE = 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4';
const WIDE = 'lg:grid-cols-6';

export default function MangaGrid({ items, loading, skeletons = 12, getSubtitle, getMeta, columns = WIDE, className }) {
  if (loading && !items?.length) {
    return (
      <div className={clsx(BASE, columns, className)}>
        {Array.from({ length: skeletons }, (_, i) => (
          <MangaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx(BASE, columns, className)}>
      {(items ?? []).map((m, i) => (
        <MangaCard key={m.id} manga={m} subtitle={getSubtitle?.(m)} meta={getMeta?.(m, i)} />
      ))}
    </div>
  );
}

/** Horizontal scroll row, used on the home and detail pages. */
export function MangaRow({ items, loading, getSubtitle }) {
  const cell = 'w-36 shrink-0 snap-start sm:w-40 lg:w-44';
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {loading && !items?.length
        ? Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={cell}>
              <MangaCardSkeleton />
            </div>
          ))
        : (items ?? []).map((m) => (
            <MangaCard key={m.id} manga={m} subtitle={getSubtitle?.(m)} className={cell} />
          ))}
    </div>
  );
}
