import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';
import FilterPanel from '../components/manga/FilterPanel';
import MangaGrid from '../components/manga/MangaGrid';
import Pagination from '../components/ui/Pagination';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useMangaSearch } from '../hooks/queries';
import { useDebounce } from '../hooks/useDebounce';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { COUNTRIES, FORMATS, SORT_OPTIONS, STATUS, genreLabel } from '../lib/constants';

const PAGE_SIZE = 30;
const LIST_KEYS = ['genres', 'excludeGenres', 'tags', 'excludeTags', 'status', 'format'];
const VALUE_KEYS = ['country', 'yearFrom', 'yearTo'];

const defaultSort = (q) => (q ? 'SEARCH_MATCH' : 'POPULARITY_DESC');

function readFilters(sp) {
  const list = (k) => (sp.get(k) ? sp.get(k).split(',').filter(Boolean) : []);
  const q = sp.get('q') ?? '';
  const sort = sp.get('sort');
  return {
    q,
    sort: SORT_OPTIONS[sort] && (sort !== 'SEARCH_MATCH' || q) ? sort : defaultSort(q),
    page: Math.max(1, Number(sp.get('page')) || 1),
    ...Object.fromEntries(LIST_KEYS.map((k) => [k, list(k)])),
    ...Object.fromEntries(VALUE_KEYS.map((k) => [k, sp.get(k) ?? ''])),
  };
}

function ActiveChip({ children, onRemove, tone = 'neutral' }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className={clsx(
        'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium',
        tone === 'include' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        tone === 'exclude' && 'bg-rose-500/10 text-rose-700 line-through dark:text-rose-400',
        tone === 'neutral' && 'bg-zinc-200/70 dark:bg-zinc-800'
      )}
    >
      {children} <X className="h-3 w-3" />
    </button>
  );
}

export default function Browse() {
  const [sp, setSp] = useSearchParams();
  const filters = useMemo(() => readFilters(sp), [sp]);
  const [query, setQuery] = useState(filters.q);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useDocumentTitle(filters.q ? `Tìm “${filters.q}”` : 'Khám phá');

  const update = (patch) => {
    const next = { ...filters, ...patch };
    if (!('page' in patch)) next.page = 1;
    if ('q' in patch && !('sort' in patch) && filters.sort === defaultSort(filters.q)) next.sort = defaultSort(next.q);
    const out = new URLSearchParams();
    if (next.q) out.set('q', next.q);
    if (next.sort !== defaultSort(next.q)) out.set('sort', next.sort);
    LIST_KEYS.forEach((k) => next[k].length && out.set(k, next[k].join(',')));
    VALUE_KEYS.forEach((k) => next[k] && out.set(k, next[k]));
    if (next.page > 1) out.set('page', String(next.page));
    setSp(out, { replace: !('page' in patch) });
  };

  useEffect(() => setQuery(filters.q), [filters.q]);
  useEffect(() => {
    if (debouncedQuery.trim() !== filters.q) update({ q: debouncedQuery.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const { data, isLoading, isFetching, error, refetch } = useMangaSearch({
    page: filters.page,
    perPage: PAGE_SIZE,
    search: filters.q || undefined,
    sort: [filters.sort],
    genres: filters.genres,
    excludedGenres: filters.excludeGenres,
    tags: filters.tags,
    excludedTags: filters.excludeTags,
    status: filters.status,
    format: filters.format,
    country: filters.country || undefined,
    yearFrom: Number(filters.yearFrom) || undefined,
    yearTo: Number(filters.yearTo) || undefined,
  });

  const removeFrom = (key, v) => update({ [key]: filters[key].filter((x) => x !== v) });
  const chips = [
    ...filters.genres.map((g) => ({ key: 'g' + g, label: genreLabel(g), tone: 'include', remove: () => removeFrom('genres', g) })),
    ...filters.excludeGenres.map((g) => ({ key: 'xg' + g, label: genreLabel(g), tone: 'exclude', remove: () => removeFrom('excludeGenres', g) })),
    ...filters.tags.map((t) => ({ key: 't' + t, label: t, tone: 'include', remove: () => removeFrom('tags', t) })),
    ...filters.excludeTags.map((t) => ({ key: 'xt' + t, label: t, tone: 'exclude', remove: () => removeFrom('excludeTags', t) })),
    ...filters.status.map((s) => ({ key: 's' + s, label: STATUS[s]?.label ?? s, remove: () => removeFrom('status', s) })),
    ...filters.format.map((f) => ({ key: 'f' + f, label: FORMATS[f] ?? f, remove: () => removeFrom('format', f) })),
    ...(filters.country ? [{ key: 'c', label: COUNTRIES[filters.country], remove: () => update({ country: '' }) }] : []),
    ...(filters.yearFrom || filters.yearTo
      ? [{ key: 'y', label: `Năm ${filters.yearFrom || '…'} – ${filters.yearTo || '…'}`, remove: () => update({ yearFrom: '', yearTo: '' }) }]
      : []),
  ];

  const goPage = (p) => {
    update({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalLabel = data ? `${data.total.toLocaleString('vi')}${data.total >= 5000 ? '+' : ''} kết quả` : 'Đang tìm...';

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Khám phá</h1>
          <p className="mt-1 text-sm text-zinc-500">{totalLabel}</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sắp xếp">
            {Object.entries(SORT_OPTIONS)
              .filter(([k]) => k !== 'SEARCH_MATCH' || filters.q)
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </select>
          <button type="button" className="btn-secondary lg:hidden" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
            {chips.length > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{chips.length}</span>}
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nhập tên truyện, ví dụ: Spy x Family"
        className="input mt-5 h-12 text-base"
        aria-label="Tên truyện"
      />

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <ActiveChip key={c.key} tone={c.tone} onRemove={c.remove}>
              {c.label}
            </ActiveChip>
          ))}
          <button
            type="button"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline"
            onClick={() =>
              update({ ...Object.fromEntries(LIST_KEYS.map((k) => [k, []])), ...Object.fromEntries(VALUE_KEYS.map((k) => [k, ''])) })
            }
          >
            Xoá bộ lọc
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside
          className={clsx(
            'lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-2',
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
            Xem {totalLabel}
          </button>
        </aside>

        <div className={clsx('min-w-0 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : !isLoading && data?.items.length === 0 ? (
            <EmptyState icon={SearchX} title="Không tìm thấy truyện nào" description="Thử đổi từ khoá hoặc bớt bộ lọc xem sao." />
          ) : (
            <MangaGrid items={data?.items} loading={isLoading} skeletons={PAGE_SIZE} columns="lg:grid-cols-4 xl:grid-cols-5" />
          )}
          <Pagination page={filters.page} totalPages={data?.lastPage ?? 0} onChange={goPage} className="mt-10" />
        </div>
      </div>
    </div>
  );
}
