import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';
import FilterPanel from '../components/manga/FilterPanel';
import MangaGrid from '../components/manga/MangaGrid';
import Pagination from '../components/ui/Pagination';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useMangaSearch, useTags } from '../hooks/queries';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SORT_OPTIONS } from '../lib/constants';
import { formatNumber } from '../lib/format';
import { useSettings } from '../store/settings';

const PAGE_SIZE = 30;
const MAX_RESULTS = 10000; // MangaDex hard limit for offset + limit
const LIST_KEYS = ['tags', 'exclude', 'status', 'demo', 'lang', 'rating'];

function readFilters(sp, defaults) {
  const list = (k) => (sp.get(k) ? sp.get(k).split(',').filter(Boolean) : []);
  const rating = list('rating');
  return {
    q: sp.get('q') ?? '',
    sort: SORT_OPTIONS[sp.get('sort')] ? sp.get('sort') : sp.get('q') ? 'relevance' : 'followedCount',
    page: Math.max(1, Number(sp.get('page')) || 1),
    tags: list('tags'),
    exclude: list('exclude'),
    status: list('status'),
    demo: list('demo'),
    lang: list('lang'),
    rating: rating.length ? rating : defaults.rating,
  };
}

export default function Browse() {
  const [sp, setSp] = useSearchParams();
  const defaultRating = useSettings((s) => s.contentRating);
  const filters = useMemo(() => readFilters(sp, { rating: defaultRating }), [sp, defaultRating]);
  const [query, setQuery] = useState(filters.q);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const { data: tags } = useTags();

  useDocumentTitle(filters.q ? `Tìm “${filters.q}”` : 'Khám phá');

  const update = (patch, { resetPage = true } = {}) => {
    const next = { ...filters, ...patch };
    if (resetPage && !('page' in patch)) next.page = 1;
    const out = new URLSearchParams();
    if (next.q) out.set('q', next.q);
    if (next.sort !== (next.q ? 'relevance' : 'followedCount')) out.set('sort', next.sort);
    LIST_KEYS.forEach((k) => {
      if (k === 'rating' && next.rating.join() === defaultRating.join()) return;
      if (next[k].length) out.set(k, next[k].join(','));
    });
    if (next.page > 1) out.set('page', String(next.page));
    setSp(out, { replace: !('page' in patch) });
  };

  // keep input in sync when navigating via header search / back button
  useEffect(() => setQuery(filters.q), [filters.q]);
  useEffect(() => {
    if (debouncedQuery.trim() !== filters.q) update({ q: debouncedQuery.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const offset = (filters.page - 1) * PAGE_SIZE;
  const { data, isLoading, isFetching, error, refetch } = useMangaSearch({
    title: filters.q || undefined,
    limit: PAGE_SIZE,
    offset,
    order: SORT_OPTIONS[filters.sort === 'relevance' && !filters.q ? 'followedCount' : filters.sort].order,
    includedTags: filters.tags,
    excludedTags: filters.exclude,
    status: filters.status,
    publicationDemographic: filters.demo,
    availableTranslatedLanguage: filters.lang,
    contentRating: filters.rating,
  });

  const totalPages = data ? Math.ceil(Math.min(data.total, MAX_RESULTS) / PAGE_SIZE) : 0;
  const activeCount = filters.tags.length + filters.exclude.length + filters.status.length + filters.demo.length + filters.lang.length;
  const tagName = (id) => tags?.find((t) => t.id === id)?.name ?? '…';

  const goPage = (p) => {
    update({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Khám phá</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {data ? `${formatNumber(data.total)} kết quả` : 'Đang tìm...'}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-auto"
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            aria-label="Sắp xếp"
          >
            {Object.entries(SORT_OPTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn-secondary lg:hidden" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
            {activeCount > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeCount}</span>
            )}
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nhập tên manga, ví dụ: Spy x Family"
        className="input mt-5 h-12 text-base"
        aria-label="Tên manga"
      />

      {activeCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {filters.tags.map((id) => (
            <button key={id} type="button" onClick={() => update({ tags: filters.tags.filter((x) => x !== id) })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {tagName(id)} <X className="h-3 w-3" />
            </button>
          ))}
          {filters.exclude.map((id) => (
            <button key={id} type="button" onClick={() => update({ exclude: filters.exclude.filter((x) => x !== id) })} className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 line-through dark:text-rose-400">
              {tagName(id)} <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline"
            onClick={() => update({ tags: [], exclude: [], status: [], demo: [], lang: [] })}
          >
            Xoá bộ lọc
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
        {/* Filters: sidebar on desktop, sheet on mobile */}
        <aside
          className={clsx(
            'lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2',
            showFilters ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-5 dark:bg-zinc-950 lg:static lg:p-0' : 'hidden'
          )}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <h2 className="text-lg font-bold">Bộ lọc</h2>
            <button type="button" className="btn-ghost btn-icon" onClick={() => setShowFilters(false)} aria-label="Đóng">
              <X className="h-5 w-5" />
            </button>
          </div>
          <FilterPanel filters={filters} onChange={update} />
          <button type="button" className="btn-primary mt-6 w-full lg:hidden" onClick={() => setShowFilters(false)}>
            Xem {data ? formatNumber(data.total) : ''} kết quả
          </button>
        </aside>

        <div className={clsx('min-w-0 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : !isLoading && data?.items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Không tìm thấy manga nào"
              description="Thử đổi từ khoá hoặc bớt bộ lọc xem sao."
            />
          ) : (
            <MangaGrid
              items={data?.items}
              loading={isLoading}
              skeletons={PAGE_SIZE}
              columns="lg:grid-cols-4 xl:grid-cols-5"
            />
          )}
          <Pagination page={filters.page} totalPages={totalPages} onChange={goPage} className="mt-10" />
        </div>
      </div>
    </div>
  );
}
