import { useMemo, useState } from 'react';
import { Check, Minus, Search } from 'lucide-react';
import clsx from 'clsx';
import { useTags } from '../../hooks/queries';
import { CONTENT_RATINGS, DEMOGRAPHICS, LANGUAGES, STATUS, TAG_GROUP_LABELS } from '../../lib/constants';
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

/** Tag button cycles: neutral -> include -> exclude -> neutral */
function TagButton({ tag, state, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={state === 'exclude' ? 'Đang loại trừ' : state === 'include' ? 'Đang chọn' : 'Bấm để chọn'}
      className={clsx(
        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition',
        state === 'include' && 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        state === 'exclude' && 'border-rose-500 bg-rose-500/10 text-rose-700 line-through dark:text-rose-400',
        !state && 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400'
      )}
    >
      {state === 'include' && <Check className="h-3 w-3" />}
      {state === 'exclude' && <Minus className="h-3 w-3" />}
      {tag.name}
    </button>
  );
}

export default function FilterPanel({ filters, onChange }) {
  const { data: tags, isLoading } = useTags();
  const [tagQuery, setTagQuery] = useState('');

  const grouped = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    const out = {};
    (tags ?? [])
      .filter((t) => !q || t.name.toLowerCase().includes(q))
      .forEach((t) => {
        (out[t.group] ||= []).push(t);
      });
    return out;
  }, [tags, tagQuery]);

  const cycleTag = (id) => {
    const { tags: inc, exclude } = filters;
    if (inc.includes(id)) onChange({ tags: inc.filter((x) => x !== id), exclude: [...exclude, id] });
    else if (exclude.includes(id)) onChange({ exclude: exclude.filter((x) => x !== id) });
    else onChange({ tags: [...inc, id] });
  };

  return (
    <div className="space-y-6">
      <Group title="Tình trạng">
        {Object.entries(STATUS).map(([k, v]) => (
          <Chip key={k} active={filters.status.includes(k)} onClick={() => onChange({ status: toggle(filters.status, k) })}>
            {v.label}
          </Chip>
        ))}
      </Group>

      <Group title="Đối tượng">
        {Object.entries(DEMOGRAPHICS).map(([k, v]) => (
          <Chip key={k} active={filters.demo.includes(k)} onClick={() => onChange({ demo: toggle(filters.demo, k) })}>
            {v}
          </Chip>
        ))}
      </Group>

      <Group title="Có bản dịch">
        {['vi', 'en', 'ja', 'ko', 'zh'].map((k) => (
          <Chip key={k} active={filters.lang.includes(k)} onClick={() => onChange({ lang: toggle(filters.lang, k) })}>
            {LANGUAGES[k]}
          </Chip>
        ))}
      </Group>

      <Group title="Mức nội dung">
        {Object.entries(CONTENT_RATINGS).map(([k, v]) => (
          <Chip
            key={k}
            active={filters.rating.includes(k)}
            onClick={() => {
              const next = toggle(filters.rating, k);
              if (next.length) onChange({ rating: next });
            }}
          >
            {v}
          </Chip>
        ))}
      </Group>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Thẻ</p>
          <p className="text-xs text-zinc-500">Bấm 1 lần để chọn, 2 lần để loại trừ</p>
        </div>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="input pl-9"
            placeholder="Lọc thẻ..."
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 24 }, (_, i) => (
              <Skeleton key={i} className="h-7 w-20" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {['genre', 'theme', 'format', 'content'].map(
              (g) =>
                grouped[g]?.length > 0 && (
                  <div key={g}>
                    <p className="mb-2 text-sm font-semibold">{TAG_GROUP_LABELS[g]}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {grouped[g].map((t) => (
                        <TagButton
                          key={t.id}
                          tag={t}
                          state={filters.tags.includes(t.id) ? 'include' : filters.exclude.includes(t.id) ? 'exclude' : null}
                          onClick={() => cycleTag(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
