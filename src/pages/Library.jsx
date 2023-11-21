import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, LibraryBig, Minus, Plus, Search, Trash2, Upload } from 'lucide-react';
import clsx from 'clsx';
import Cover from '../components/ui/Cover';
import { EmptyState } from '../components/ui/States';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { timeAgo } from '../lib/format';
import { LIST_STATUS, exportLibrary, importLibrary, removeEntry, saveEntry, useLibrary } from '../store/library';

const SORTS = {
  updatedAt: 'Cập nhật gần đây',
  title: 'Tên A → Z',
  userScore: 'Điểm của bạn',
  addedAt: 'Mới thêm',
};

function EntryRow({ entry }) {
  // the stored snapshot has the fields saveEntry needs
  const manga = { ...entry, coverSmall: entry.cover, status: entry.mangaStatus };
  const pct = entry.chapters ? Math.round((entry.progress / entry.chapters) * 100) : null;
  return (
    <li className="card flex gap-4 p-3 animate-fade-in">
      <Link to={`/manga/${entry.id}`} className="w-16 shrink-0 sm:w-20">
        <Cover src={entry.cover} alt={entry.title} color={entry.color} rounded="rounded-lg" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/manga/${entry.id}`} className="line-clamp-2 font-semibold hover:text-brand-600">
            {entry.title}
          </Link>
          <button
            type="button"
            onClick={() => removeEntry(entry.id)}
            className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
            aria-label={`Xoá ${entry.title}`}
            title="Xoá khỏi tủ"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          Cập nhật {timeAgo(entry.updatedAt)}
          {entry.userScore ? ` · Bạn chấm ${entry.userScore}/10` : ''}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
          <select
            value={entry.status}
            onChange={(e) => saveEntry(manga, { status: e.target.value })}
            className="input h-9 w-auto py-1 text-xs"
            aria-label="Trạng thái"
          >
            {Object.entries(LIST_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              className="btn-ghost btn-icon h-8 w-8"
              onClick={() => saveEntry(manga, { progress: entry.progress - 1 })}
              disabled={entry.progress <= 0}
              aria-label="Giảm 1 chương"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[4.5rem] text-center tabular-nums">
              Ch. <b>{entry.progress}</b>/{entry.chapters ?? '?'}
            </span>
            <button
              type="button"
              className="btn-ghost btn-icon h-8 w-8"
              onClick={() => saveEntry(manga, { progress: entry.progress + 1 })}
              disabled={Boolean(entry.chapters) && entry.progress >= entry.chapters}
              aria-label="Tăng 1 chương"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {pct !== null && (
            <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 sm:block dark:bg-zinc-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Library() {
  useDocumentTitle('Tủ truyện');
  const entries = useLibrary((s) => s.entries);
  const [sp, setSp] = useSearchParams();
  const tab = LIST_STATUS[sp.get('status')] ? sp.get('status') : 'ALL';
  const [sort, setSort] = useState('updatedAt');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState(null);
  const fileRef = useRef(null);

  const all = useMemo(() => Object.values(entries), [entries]);
  const counts = useMemo(() => {
    const c = { ALL: all.length };
    all.forEach((e) => (c[e.status] = (c[e.status] || 0) + 1));
    return c;
  }, [all]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((e) => (tab === 'ALL' || e.status === tab) && (!q || e.title.toLowerCase().includes(q)))
      .sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title) : (b[sort] ?? 0) - (a[sort] ?? 0)));
  }, [all, tab, query, sort]);

  const download = () => {
    const blob = new Blob([exportLibrary()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emanga-tu-truyen-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file) => {
    if (!file) return;
    try {
      const n = importLibrary(await file.text());
      setMessage({ ok: true, text: `Đã nhập ${n} truyện.` });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
    fileRef.current.value = '';
  };

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Tủ truyện</h1>
          <p className="mt-1 text-sm text-zinc-500">Lưu trên trình duyệt này. Dùng sao lưu để chuyển sang máy khác.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={download} disabled={!all.length}>
            <Download className="h-4 w-4" /> Sao lưu
          </button>
          <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Khôi phục
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={clsx(
            'mt-4 rounded-xl px-4 py-2 text-sm',
            message.ok ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
          )}
        >
          {message.text}
        </p>
      )}

      <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4" role="tablist">
        {[['ALL', 'Tất cả'], ...Object.entries(LIST_STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setSp(k === 'ALL' ? {} : { status: k }, { replace: true })}
            className={clsx(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
              tab === k ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-200/60 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800'
            )}
          >
            {label} <span className="opacity-60">{counts[k] || 0}</span>
          </button>
        ))}
      </div>

      {all.length === 0 ? (
        <EmptyState
          icon={LibraryBig}
          title="Tủ truyện đang trống"
          description="Bấm “Thêm vào tủ” ở trang truyện để theo dõi những bộ bạn đang đọc hoặc muốn đọc."
        >
          <Link to="/browse" className="btn-primary mt-2">
            Khám phá truyện
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input className="input pl-9" placeholder="Tìm trong tủ..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sắp xếp">
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          {list.length ? (
            <ul className="mt-4 grid gap-3 lg:grid-cols-2">
              {list.map((e) => (
                <EntryRow key={e.id} entry={e} />
              ))}
            </ul>
          ) : (
            <EmptyState title="Không có truyện nào ở mục này" />
          )}
        </>
      )}
    </div>
  );
}
