import { useEffect, useRef, useState } from 'react';
import { BookmarkCheck, BookmarkPlus, ChevronDown, Minus, Plus, Star, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { LIST_STATUS, removeEntry, saveEntry, useLibrary } from '../../store/library';

/** Add-to-library button with status menu. */
export function TrackButton({ manga }) {
  const entry = useLibrary((s) => s.entries[manga.id]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!entry) {
    return (
      <button type="button" className="btn-secondary" onClick={() => saveEntry(manga, { status: 'PLANNING' })}>
        <BookmarkPlus className="h-4 w-4" /> Thêm vào tủ
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="btn-secondary text-brand-600 dark:text-brand-400"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <BookmarkCheck className="h-4 w-4" /> {LIST_STATUS[entry.status].label}
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="card absolute left-0 z-30 mt-2 w-52 animate-fade-in p-1 text-left shadow-xl">
          {Object.entries(LIST_STATUS).map(([k, v]) => (
            <button
              key={k}
              type="button"
              role="menuitemradio"
              aria-checked={entry.status === k}
              onClick={() => {
                saveEntry(manga, { status: k, ...(k === 'COMPLETED' && manga.chapters ? { progress: manga.chapters } : {}) });
                setOpen(false);
              }}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800',
                entry.status === k && 'font-semibold'
              )}
            >
              <span className={clsx('h-2 w-2 rounded-full', v.color)} /> {v.label}
            </button>
          ))}
          <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              removeEntry(manga.id);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" /> Xoá khỏi tủ
          </button>
        </div>
      )}
    </div>
  );
}

/** Progress + personal score editor, shown once the manga is in the library. */
export function ProgressCard({ manga }) {
  const entry = useLibrary((s) => s.entries[manga.id]);
  const [draft, setDraft] = useState('');
  if (!entry) return null;

  const total = manga.chapters;
  const pct = total ? Math.round((entry.progress / total) * 100) : null;
  const commit = () => {
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) saveEntry(manga, { progress: n });
    setDraft('');
  };

  return (
    <div className="card space-y-4 p-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tiến độ của bạn</h3>
          {pct !== null && <span className="text-xs text-zinc-500">{pct}%</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary btn-icon h-9 w-9"
            onClick={() => saveEntry(manga, { progress: entry.progress - 1 })}
            disabled={entry.progress <= 0}
            aria-label="Giảm 1 chương"
          >
            <Minus className="h-4 w-4" />
          </button>
          <label className="flex flex-1 items-baseline justify-center gap-1 text-sm">
            <span className="sr-only">Chương đã đọc</span>
            Ch.
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={total || undefined}
              value={draft !== '' ? draft : entry.progress}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="w-16 rounded-lg bg-transparent text-center text-lg font-bold outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <span className="text-zinc-500">/ {total ?? '?'}</span>
          </label>
          <button
            type="button"
            className="btn-primary btn-icon h-9 w-9"
            onClick={() => saveEntry(manga, { progress: entry.progress + 1 })}
            disabled={Boolean(total) && entry.progress >= total}
            aria-label="Tăng 1 chương"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {pct !== null && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Điểm của bạn</h3>
        <div className="flex gap-0.5" role="radiogroup" aria-label="Chấm điểm">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={entry.userScore === n}
              title={`${n}/10`}
              onClick={() => saveEntry(manga, { userScore: entry.userScore === n ? 0 : n })}
              className="p-0.5"
            >
              <Star
                className={clsx(
                  'h-5 w-5 transition',
                  n <= (entry.userScore || 0) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
