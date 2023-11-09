import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, Sparkles, Tags } from 'lucide-react';
import HeroCarousel from '../components/manga/HeroCarousel';
import MangaGrid, { MangaRow } from '../components/manga/MangaGrid';
import Section from '../components/ui/Section';
import { ErrorState } from '../components/ui/States';
import { useLatestChapters, useMangaSearch, useTags } from '../hooks/queries';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSettings } from '../store/settings';
import { timeAgo } from '../lib/format';

const FEATURED_GENRES = ['Action', 'Romance', 'Comedy', 'Fantasy', 'Isekai', 'Slice of Life', 'Drama', 'Horror', 'Sports', 'Mystery'];

function useLatestUpdates(languages, contentRating) {
  const chapters = useLatestChapters({ limit: 64, languages, contentRating });

  // One entry per manga, keep the newest chapter
  const latestByManga = useMemo(() => {
    const map = new Map();
    (chapters.data ?? []).forEach((c) => {
      if (c.mangaId && !map.has(c.mangaId)) map.set(c.mangaId, c);
    });
    return map;
  }, [chapters.data]);

  const ids = [...latestByManga.keys()].slice(0, 18);
  const manga = useMangaSearch(
    { ids, limit: ids.length, contentRating, order: undefined },
    { enabled: ids.length > 0 }
  );

  const items = useMemo(() => {
    if (!manga.data) return [];
    const byId = new Map(manga.data.items.map((m) => [m.id, m]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manga.data, ids.join()]);

  return {
    items,
    latestByManga,
    isLoading: chapters.isLoading || manga.isLoading,
    error: chapters.error || manga.error,
    refetch: () => (chapters.error ? chapters.refetch() : manga.refetch()),
  };
}

export default function Home() {
  useDocumentTitle();
  const contentRating = useSettings((s) => s.contentRating);
  const languages = useSettings((s) => s.translatedLanguage);

  const base = { contentRating, availableTranslatedLanguage: languages };
  const featured = useMangaSearch({ ...base, limit: 8, order: { followedCount: 'desc' } });
  const popular = useMangaSearch({ ...base, limit: 18, offset: 8, order: { followedCount: 'desc' } });
  const recent = useMangaSearch({ ...base, limit: 12, order: { createdAt: 'desc' } });
  const latest = useLatestUpdates(languages, contentRating);
  const { data: tags } = useTags();

  const genreLinks = (tags ?? []).filter((t) => FEATURED_GENRES.includes(t.name));

  return (
    <div className="pb-8">
      {featured.error ? (
        <div className="container-page pt-6">
          <ErrorState error={featured.error} onRetry={featured.refetch} />
        </div>
      ) : (
        <HeroCarousel items={featured.data?.items} loading={featured.isLoading} />
      )}

      <Section title="Mới cập nhật" icon={Clock} to="/browse?sort=latestUploadedChapter">
        {latest.error ? (
          <ErrorState error={latest.error} onRetry={latest.refetch} />
        ) : (
          <MangaGrid
            items={latest.items}
            loading={latest.isLoading}
            skeletons={12}
            getMeta={(m) => {
              const c = latest.latestByManga.get(m.id);
              return c?.chapter ? `Ch. ${c.chapter}` : null;
            }}
            getSubtitle={(m) => timeAgo(latest.latestByManga.get(m.id)?.readableAt)}
          />
        )}
      </Section>

      <Section title="Phổ biến" icon={Flame} to="/browse?sort=followedCount">
        {popular.error ? (
          <ErrorState error={popular.error} onRetry={popular.refetch} />
        ) : (
          <MangaRow items={popular.data?.items} loading={popular.isLoading} />
        )}
      </Section>

      {genreLinks.length > 0 && (
        <Section title="Thể loại" icon={Tags} to="/browse" linkLabel="Tìm nâng cao">
          <div className="flex flex-wrap gap-2">
            {genreLinks.map((t) => (
              <Link
                key={t.id}
                to={`/browse?tags=${t.id}`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition hover:border-brand-500 hover:text-brand-600 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Mới thêm" icon={Sparkles} to="/browse?sort=createdAt">
        {recent.error ? (
          <ErrorState error={recent.error} onRetry={recent.refetch} />
        ) : (
          <MangaGrid items={recent.data?.items} loading={recent.isLoading} skeletons={12} />
        )}
      </Section>
    </div>
  );
}
