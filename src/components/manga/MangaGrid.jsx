import clsx from 'clsx';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { useStatistics } from '../../hooks/queries';

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

/** Grid of manga cards; fetches ratings for all visible items in one request. */
export default function MangaGrid({ items, loading, skeletons = 12, getSubtitle, getMeta, className }) {
  const ids = items?.map((m) => m.id) ?? [];
  const { data: stats } = useStatistics(ids);

  if (loading && !items?.length) {
    return (
      <div className={clsx(GRID, className)}>
        {Array.from({ length: skeletons }, (_, i) => (
          <MangaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx(GRID, className)}>
      {items.map((m) => (
        <MangaCard
          key={m.id}
          manga={m}
          stats={stats?.[m.id]}
          subtitle={getSubtitle?.(m)}
          meta={getMeta?.(m)}
        />
      ))}
    </div>
  );
}

/** Horizontal scroll row, used on the home page. */
export function MangaRow({ items, loading }) {
  const ids = items?.map((m) => m.id) ?? [];
  const { data: stats } = useStatistics(ids);
  const cell = 'w-36 shrink-0 snap-start sm:w-40 lg:w-44';
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {loading && !items?.length
        ? Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={cell}>
              <MangaCardSkeleton />
            </div>
          ))
        : items.map((m) => <MangaCard key={m.id} manga={m} stats={stats?.[m.id]} className={cell} />)}
    </div>
  );
}
