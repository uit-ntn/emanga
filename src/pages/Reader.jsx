import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Home as HomeIcon, Settings2, Users, X } from 'lucide-react';
import clsx from 'clsx';
import ReaderImage from '../components/reader/ReaderImage';
import ReaderSettings from '../components/reader/ReaderSettings';
import PageLoader from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import { useManga, useReaderChapter, useReaderFeed } from '../hooks/queries';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { buildNavigation, chapterLabel } from '../lib/chapters';
import { libraryStore, recordRead } from '../store/library';
import { updateSettings, useSettings } from '../store/settings';

const NO_IMAGES = [];
const darkBtn = 'btn-ghost btn-icon text-zinc-200 hover:bg-zinc-800 disabled:opacity-30';

export default function Reader() {
  const { id: mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const { readerMode, readerFit, dataSaver } = useSettings();

  const { data: manga } = useManga(mangaId);
  const chapterQ = useReaderChapter(chapterId, dataSaver);
  const chapter = chapterQ.data;
  const images = chapter?.images ?? NO_IMAGES;
  const feed = useReaderFeed(chapter?.mangadexId, chapter?.language);
  const nav = useMemo(() => buildNavigation(feed.data, chapter), [feed.data, chapter]);

  const [page, setPage] = useState(0);
  const [barsVisible, setBarsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pageRefs = useRef([]);
  const lastScroll = useRef(0);
  const restored = useRef(false);

  useDocumentTitle(manga && chapter ? `${chapterLabel(chapter)} – ${manga.title}` : 'Đang tải chương');

  // New chapter: resume the saved page if this is the chapter we stopped at
  useEffect(() => {
    restored.current = false;
    const last = libraryStore.getState().entries[mangaId]?.lastRead;
    setPage(last?.chapterId === chapterId ? last.page || 0 : 0);
    window.scrollTo({ top: 0 });
    setBarsVisible(true);
  }, [chapterId, mangaId]);

  // Vertical mode: scroll to the restored page once images are rendered
  useEffect(() => {
    if (restored.current || !images.length || readerMode !== 'vertical') return;
    restored.current = true;
    if (page > 0) requestAnimationFrame(() => pageRefs.current[page]?.scrollIntoView({ block: 'start' }));
  }, [images.length, readerMode, page]);

  // Remember progress
  useEffect(() => {
    if (manga && chapter && images.length) recordRead(manga, chapter, Math.min(page, images.length - 1));
  }, [manga, chapter, page, images.length]);

  // Vertical mode: track the page in the middle of the viewport
  useEffect(() => {
    if (readerMode !== 'vertical' || !images.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setPage(Number(e.target.dataset.index))),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    pageRefs.current.slice(0, images.length).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [readerMode, images.length, chapterId]);

  // Hide bars while scrolling down
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastScroll.current) < 12) return;
      setBarsVisible(y < lastScroll.current || y < 80);
      lastScroll.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goChapter = useCallback((c) => c && navigate(`/manga/${mangaId}/chapter/${c.id}`), [navigate, mangaId]);

  const goPage = useCallback(
    (dir) => {
      const target = page + dir;
      if (target < 0) return goChapter(nav.prev);
      if (target >= images.length) return goChapter(nav.next);
      setPage(target);
      window.scrollTo({ top: 0 });
      return undefined;
    },
    [page, images.length, nav.prev, nav.next, goChapter]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (/input|select|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'Escape') setSettingsOpen(false);
      else if (e.key === '[') goChapter(nav.prev);
      else if (e.key === ']') goChapter(nav.next);
      else if (e.key.toLowerCase() === 'm') updateSettings({ readerMode: readerMode === 'single' ? 'vertical' : 'single' });
      else if (readerMode === 'single' && (e.key === 'ArrowRight' || e.key === ' ')) {
        e.preventDefault();
        goPage(1);
      } else if (readerMode === 'single' && e.key === 'ArrowLeft') goPage(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goChapter, goPage, nav.prev, nav.next, readerMode]);

  // Single page mode: preload the next two pages
  useEffect(() => {
    if (readerMode !== 'single') return;
    [page + 1, page + 2].forEach((i) => {
      if (images[i]) new Image().src = images[i];
    });
  }, [page, images, readerMode]);

  if (chapterQ.isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <PageLoader />
      </div>
    );
  }
  if (chapterQ.error) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
        <ErrorState error={chapterQ.error} onRetry={chapterQ.refetch} className="mx-auto mt-20 max-w-md border-zinc-800 bg-zinc-900" />
        <p className="mt-6 text-center">
          <Link to={`/manga/${mangaId}`} className="text-sm text-zinc-400 underline">
            Về trang truyện
          </Link>
        </p>
      </div>
    );
  }

  const current = Math.min(page, Math.max(images.length - 1, 0));
  const progress = images.length ? ((current + 1) / images.length) * 100 : 0;
  const atEnd = readerMode === 'vertical' || current === images.length - 1 || chapter.externalUrl;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-zinc-950/90 backdrop-blur transition-transform duration-300',
          !barsVisible && !settingsOpen && '-translate-y-full'
        )}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3">
          <Link to={`/manga/${mangaId}`} className={darkBtn} aria-label="Về trang truyện">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/manga/${mangaId}`} className="block truncate text-sm font-semibold hover:text-brand-400">
              {manga?.title ?? '…'}
            </Link>
            <p className="truncate text-xs text-zinc-400">
              {chapterLabel(chapter)}
              {chapter.title ? ` – ${chapter.title}` : ''}
            </p>
          </div>
          <Link to="/" className={clsx(darkBtn, 'hidden sm:inline-flex')} aria-label="Trang chủ">
            <HomeIcon className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className={darkBtn}
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label="Cài đặt đọc"
            aria-expanded={settingsOpen}
          >
            {settingsOpen ? <X className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
          </button>
        </div>
        {settingsOpen && (
          <div className="mx-auto max-w-5xl px-3 pb-3">
            <div className="ml-auto w-full animate-fade-in rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-2xl sm:w-80">
              <ReaderSettings />
            </div>
          </div>
        )}
        <div className="h-0.5 bg-zinc-800">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="pb-24 pt-14">
        {chapter.externalUrl ? (
          <div className="mx-auto mt-24 max-w-md px-6 text-center">
            <ExternalLink className="mx-auto h-10 w-10 text-zinc-500" />
            <h1 className="mt-4 text-lg font-semibold">Chương này được đăng trên trang chính thức</h1>
            <a href={chapter.externalUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6">
              Mở trang đọc <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : readerMode === 'single' ? (
          <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
            {images[current] && <ReaderImage key={images[current]} src={images[current]} index={current} fit={readerFit} eager />}
            <button type="button" aria-label="Trang trước" className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize" onClick={() => goPage(-1)} />
            <button type="button" aria-label="Hiện/ẩn thanh công cụ" className="absolute inset-y-0 left-1/3 w-1/3" onClick={() => setBarsVisible((v) => !v)} />
            <button type="button" aria-label="Trang sau" className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize" onClick={() => goPage(1)} />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {images.map((src, i) => (
              <ReaderImage key={src} ref={(el) => (pageRefs.current[i] = el)} src={src} index={i} fit={readerFit} eager={i < 3} />
            ))}
          </div>
        )}

        {atEnd && (
          <div className="mx-auto mt-10 max-w-3xl px-4 text-center">
            <p className="text-sm text-zinc-400">Hết {chapterLabel(chapter)}</p>
            {chapter.groups.length > 0 && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <Users className="h-3.5 w-3.5" /> Dịch bởi {chapter.groups.join(', ')} · nguồn MangaDex
              </p>
            )}
            <div className="mt-5 flex justify-center gap-3">
              {nav.prev && (
                <button type="button" className="btn bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => goChapter(nav.prev)}>
                  <ChevronLeft className="h-4 w-4" /> Chương trước
                </button>
              )}
              {nav.next ? (
                <button type="button" className="btn-primary" onClick={() => goChapter(nav.next)}>
                  Chương tiếp <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                !feed.isLoading && (
                  <Link to={`/manga/${mangaId}`} className="btn bg-zinc-800 text-zinc-100 hover:bg-zinc-700">
                    Đã là chương mới nhất
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <footer
        className={clsx(
          'fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-zinc-950/90 backdrop-blur transition-transform duration-300',
          !barsVisible && 'translate-y-full'
        )}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3">
          <button type="button" className={darkBtn} disabled={!nav.prev} onClick={() => goChapter(nav.prev)} aria-label="Chương trước">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <select
            className="input h-10 min-w-0 flex-1 border-zinc-800 bg-zinc-900 text-zinc-100"
            value={chapter.id}
            onChange={(e) => goChapter(nav.list.find((c) => c.id === e.target.value))}
            aria-label="Chọn chương"
          >
            {(nav.list.length ? [...nav.list].reverse() : [chapter]).map((c) => (
              <option key={c.id} value={c.id}>
                {chapterLabel(c)}
                {c.title ? ` – ${c.title}` : ''}
              </option>
            ))}
          </select>
          {images.length > 0 && (
            <span className="shrink-0 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-medium tabular-nums">
              {current + 1}/{images.length}
            </span>
          )}
          <button type="button" className={darkBtn} disabled={!nav.next} onClick={() => goChapter(nav.next)} aria-label="Chương sau">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
