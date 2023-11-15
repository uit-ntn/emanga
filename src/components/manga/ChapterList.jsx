import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, ExternalLink, Eye, Search, Users } from 'lucide-react';
import clsx from 'clsx';
import { EmptyState, Skeleton } from '../ui/States';
import { timeAgo } from '../../lib/format';
import { setChapterRead, useLibrary } from '../../store/library';

const STEP = 60;
const num = (c) => (c.chapter === null || c.chapter === undefined ? -1 : parseFloat(c.chapter));

/** Group chapters that share the same number (different scanlation groups). */
function groupChapters(chapters, asc) {
  const map = new Map();
  chapters.forEach((c) => {
    const key = c.chapter ?? `oneshot-${c.id}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(c);
  });
  const groups = [...map.values()];
  groups.sort((a, b) => (asc ? num(a[0]) - num(b[0]) : num(b[0]) - num(a[0])));
  return groups;
}

function ChapterRow({ chapter, mangaId, isRead, compact }) {
  const label = chapter.chapter ? `Chương ${chapter.chapter}` : 'Oneshot';
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className={clsx('truncate text-sm font-medium', isRead && 'text-zinc-400 dark:text-zinc-500')}>
          {!compact && label}
          {chapter.title && <span className={clsx(!compact && 'text-zinc-500')}>{compact ? chapter.title : ` – ${chapter.title}`}</span>}
          {compact && !chapter.title && label}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-500">
          <Users className="h-3 w-3 shrink-0" />
          {chapter.groups.map((g) => g.name).join(', ') || 'Không rõ nhóm dịch'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
        {chapter.externalUrl && <ExternalLink className="h-4 w-4" aria-label="Link ngoài" />}
        <span className="hidden sm:inline">{timeAgo(chapter.readableAt)}</span>
      </div>
    </>
  );
  const cls =
    'flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/60';
  return (
    <div className="group flex items-center">
      {chapter.externalUrl ? (
        <a href={chapter.externalUrl} target="_blank" rel="noreferrer" className={cls}>
          {content}
        </a>
      ) : (
        <Link to={`/manga/${mangaId}/chapter/${chapter.id}`} className={cls}>
          {content}
        </Link>
      )}
      <button
        type="button"
        onClick={() => setChapterRead(chapter.id, !isRead)}
        className={clsx(
          'ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg transition',
          isRead ? 'text-emerald-500' : 'text-zinc-300 opacity-0 hover:text-zinc-500 group-hover:opacity-100 dark:text-zinc-600'
        )}
        title={isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
        aria-label={isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
      >
        {isRead ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ChapterList({ chapters, mangaId, loading }) {
  const [asc, setAsc] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(STEP);
  const read = useLibrary((s) => s.read);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? (chapters ?? []).filter((c) => c.chapter?.includes(q) || c.title?.toLowerCase().includes(q))
      : chapters ?? [];
    return groupChapters(filtered, asc);
  }, [chapters, asc, query]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!chapters?.length) {
    return (
      <EmptyState
        title="Chưa có chương nào"
        description="Truyện chưa có bản dịch ở ngôn ngữ này hoặc đã bị gỡ do bản quyền. Hãy thử chọn ngôn ngữ khác."
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="input pl-9"
            placeholder="Tìm số chương..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(STEP);
            }}
          />
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setAsc((v) => !v)}
          title={asc ? 'Cũ nhất trước' : 'Mới nhất trước'}
        >
          {asc ? <ArrowUpNarrowWide className="h-4 w-4" /> : <ArrowDownWideNarrow className="h-4 w-4" />}
          <span className="hidden sm:inline">{asc ? 'Cũ nhất' : 'Mới nhất'}</span>
        </button>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {groups.slice(0, visible).map((group) => (
          <div key={group[0].id} className="py-1">
            {group.length === 1 ? (
              <ChapterRow chapter={group[0]} mangaId={mangaId} isRead={Boolean(read[group[0].id])} />
            ) : (
              <>
                <p className="px-3 pt-2 text-sm font-semibold">
                  {group[0].chapter ? `Chương ${group[0].chapter}` : 'Oneshot'}
                </p>
                <div className="pl-3">
                  {group.map((c) => (
                    <ChapterRow key={c.id} chapter={c} mangaId={mangaId} isRead={Boolean(read[c.id])} compact />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {groups.length > visible && (
        <button type="button" className="btn-secondary mt-4 w-full" onClick={() => setVisible((v) => v + STEP)}>
          Xem thêm ({groups.length - visible} chương)
        </button>
      )}
    </div>
  );
}
