import { useMemo, useState } from 'react';
import { Check, Minus, Search } from 'lucide-react';
import clsx from 'clsx';
import { useGenresAndTags } from '../../hooks/queries';
import { COUNTRIES, FORMATS, STATUS, genreLabel } from '../../lib/constants';
import { Skeleton } from '../ui/States';

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
      )}
    >
      {children}
    </button>
  );
}

function Group({ title, children }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Button cycles: neutral -> include -> exclude -> neutral */
function TriButton({ label, title, state, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition',
        state === 'include' && 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        state === 'exclude' && 'border-rose-500 bg-rose-500/10 text-rose-700 line-through dark:text-rose-400',
        !state && 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400'
      )}
    >
      {state === 'include' && <Check className="h-3 w-3" />}
      {state === 'exclude' && <Minus className="h-3 w-3" />}
      {label}
    </button>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

export default function FilterPanel({ filters, onChange }) {
  const { data: meta, isLoading } = useGenresAndTags();
  const [tagQuery, setTagQuery] = useState('');

  const cycle = (incKey, excKey, value) => {
    const inc = filters[incKey];
    const exc = filters[excKey];
    if (inc.includes(value)) onChange({ [incKey]: inc.filter((x) => x !== value), [excKey]: [...exc, value] });
    else if (exc.includes(value)) onChange({ [excKey]: exc.filter((x) => x !== value) });
    else onChange({ [incKey]: [...inc, value] });
  };
  const triState = (incKey, excKey, v) =>
    filters[incKey].includes(v) ? 'include' : filters[excKey].includes(v) ? 'exclude' : null;

  const tagsByCategory = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return null;
    return (meta?.tags ?? []).filter((t) => t.name.toLowerCase().includes(q)).slice(0, 40);
  }, [meta, tagQuery]);

  const selectedTags = [...filters.tags, ...filters.excludeTags];

  return (
    <div className="space-y-6">
      <Group title="Tình trạng">
        {Object.entries(STATUS).map(([k, v]) => (
          <Chip key={k} active={filters.status.includes(k)} onClick={() => onChange({ status: toggle(filters.status, k) })}>
            {v.label}
          </Chip>
        ))}
      </Group>

      <Group title="Quốc gia">
        {Object.entries(COUNTRIES).map(([k, v]) => (
          <Chip key={k} active={filters.country === k} onClick={() => onChange({ country: filters.country === k ? '' : k })}>
            {v}
          </Chip>
        ))}
      </Group>

      <Group title="Định dạng">
        {Object.entries(FORMATS).map(([k, v]) => (
          <Chip key={k} active={filters.format.includes(k)} onClick={() => onChange({ format: toggle(filters.format, k) })}>
            {v}
          </Chip>
        ))}
      </Group>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Năm phát hành</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input"
            placeholder="Từ"
            min={1950}
            max={CURRENT_YEAR + 2}
            value={filters.yearFrom}
            onChange={(e) => onChange({ yearFrom: e.target.value })}
            aria-label="Từ năm"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="number"
            className="input"
            placeholder="Đến"
            min={1950}
            max={CURRENT_YEAR + 2}
            value={filters.yearTo}
            onChange={(e) => onChange({ yearTo: e.target.value })}
            aria-label="Đến năm"
          />
        </div>
      </fieldset>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Thể loại</p>
          <p className="text-[11px] text-zinc-500">1 lần: chọn · 2 lần: loại trừ</p>
        </div>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 18 }, (_, i) => (
              <Skeleton key={i} className="h-7 w-20" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(meta?.genres ?? []).map((g) => (
              <TriButton
                key={g}
                label={genreLabel(g)}
                state={triState('genres', 'excludeGenres', g)}
                onClick={() => cycle('genres', 'excludeGenres', g)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Thẻ (tag)</p>
        {selectedTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {selectedTags.map((t) => (
              <TriButton key={t} label={t} state={triState('tags', 'excludeTags', t)} onClick={() => cycle('tags', 'excludeTags', t)} />
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="input pl-9"
            placeholder="Tìm tag: Isekai, Time Skip..."
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
          />
        </div>
        {tagsByCategory && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tagsByCategory.length ? (
              tagsByCategory
                .filter((t) => !selectedTags.includes(t.name))
                .map((t) => (
                  <TriButton
                    key={t.name}
                    label={t.name}
                    title={t.description}
                    state={null}
                    onClick={() => cycle('tags', 'excludeTags', t.name)}
                  />
                ))
            ) : (
              <p className="text-sm text-zinc-500">Không có tag phù hợp</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
