import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, BookmarkCheck, ExternalLink, Search, Users } from 'lucide-react';
import clsx from 'clsx';
import { EmptyState, Skeleton } from '../ui/States';
import { timeAgo } from '../../lib/format';
import { chapterNum, chapterTitle } from '../../lib/chapters';

const STEP = 50;

/** Group chapters that share the same number (different scanlation groups). */
function groupChapters(chapters, asc) {
  const map = new Map();
  chapters.forEach((c) => {
    const key = c.chapter ?? `oneshot-${c.id}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(c);
  });
  return [...map.values()].sort((a, b) => (asc ? chapterNum(a[0]) - chapterNum(b[0]) : chapterNum(b[0]) - chapterNum(a[0])));
}

function ChapterRow({ chapter, mangaId, isRead, isLast, compact }) {
  const label = chapterTitle(chapter);
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className={clsx('truncate text-sm font-medium', isRead && !isLast && 'text-zinc-400 dark:text-zinc-500')}>
          {compact ? chapter.title || label : label}
          {!compact && chapter.title && <span className="text-zinc-500"> – {chapter.title}</span>}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-500">
          <Users className="h-3 w-3 shrink-0" />
          {chapter.groups.join(', ') || 'Không rõ nhóm dịch'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
        {isLast && (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-600/10 px-1.5 py-0.5 font-semibold text-brand-600 dark:text-brand-400">
            <BookmarkCheck className="h-3.5 w-3.5" /> Đang đọc
          </span>
        )}
        {chapter.externalUrl && <ExternalLink className="h-4 w-4" aria-label="Đọc ở trang ngoài" />}
        <span className="hidden sm:inline">{timeAgo(chapter.readableAt)}</span>
      </div>
    </>
  );
  const cls = 'flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/60';
  return chapter.externalUrl ? (
    <a href={chapter.externalUrl} target="_blank" rel="noreferrer" className={cls}>
      {content}
    </a>
  ) : (
    <Link to={`/manga/${mangaId}/chapter/${chapter.id}`} className={cls}>
      {content}
    </Link>
  );
}

export default function ChapterList({ chapters, mangaId, loading, progress = 0, lastChapterId }) {
  const [asc, setAsc] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(STEP);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = chapters ?? [];
    const filtered = q ? list.filter((c) => c.chapter?.includes(q) || c.title?.toLowerCase().includes(q)) : list;
    return groupChapters(filtered, asc);
  }, [chapters, asc, query]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!chapters?.length) {
    return (
      <EmptyState
        title="Chưa có chương ở ngôn ngữ này"
        description="Truyện có thể đã bị gỡ do bản quyền. Thử ngôn ngữ khác hoặc đọc trên nền tảng chính thức bên dưới."
        className="py-8"
      />
    );
  }

  const isRead = (c) => chapterNum(c) > 0 && chapterNum(c) <= progress;

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
        <button type="button" className="btn-secondary" onClick={() => setAsc((v) => !v)} title={asc ? 'Cũ nhất trước' : 'Mới nhất trước'}>
          {asc ? <ArrowUpNarrowWide className="h-4 w-4" /> : <ArrowDownWideNarrow className="h-4 w-4" />}
          <span className="hidden sm:inline">{asc ? 'Cũ nhất' : 'Mới nhất'}</span>
        </button>
      </div>

      <div className="max-h-[36rem] divide-y divide-zinc-100 overflow-y-auto pr-1 dark:divide-zinc-800/80">
        {groups.slice(0, visible).map((group) => (
          <div key={group[0].id} className="py-1">
            {group.length === 1 ? (
              <ChapterRow chapter={group[0]} mangaId={mangaId} isRead={isRead(group[0])} isLast={group[0].id === lastChapterId} />
            ) : (
              <>
                <p className="px-3 pt-2 text-sm font-semibold">{chapterTitle(group[0])}</p>
                <div className="pl-3">
                  {group.map((c) => (
                    <ChapterRow key={c.id} chapter={c} mangaId={mangaId} isRead={isRead(c)} isLast={c.id === lastChapterId} compact />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
        {groups.length > visible && (
          <div className="py-3">
            <button type="button" className="btn-secondary w-full" onClick={() => setVisible((v) => v + STEP)}>
              Xem thêm ({groups.length - visible} chương)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
