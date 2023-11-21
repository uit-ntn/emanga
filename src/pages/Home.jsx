import { Link } from 'react-router-dom';
import { BookOpenCheck, CalendarClock, Flame, Sparkles, Tags, Trophy } from 'lucide-react';
import HeroCarousel from '../components/manga/HeroCarousel';
import MangaGrid, { MangaRow } from '../components/manga/MangaGrid';
import Section from '../components/ui/Section';
import { ErrorState } from '../components/ui/States';
import { useGenresAndTags, useMangaSearch } from '../hooks/queries';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { genreLabel } from '../lib/constants';
import { useLibrary } from '../store/library';

function Block({ query, children }) {
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  return children;
}

export default function Home() {
  useDocumentTitle();
  const trending = useMangaSearch({ perPage: 20, sort: ['TRENDING_DESC', 'POPULARITY_DESC'] });
  const popular = useMangaSearch({ perPage: 18, sort: ['POPULARITY_DESC'] });
  const topRated = useMangaSearch({ perPage: 12, sort: ['SCORE_DESC'] });
  const manhwa = useMangaSearch({ perPage: 18, sort: ['TRENDING_DESC'], country: 'KR' });
  const upcoming = useMangaSearch({ perPage: 12, sort: ['POPULARITY_DESC'], status: ['NOT_YET_RELEASED'] });
  const { data: meta } = useGenresAndTags();
  const entries = useLibrary((s) => s.entries);
  const reading = Object.values(entries)
    .filter((e) => e.status === 'READING')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 12)
    .map((e) => ({ ...e, coverSmall: e.cover, status: e.mangaStatus, genres: [], _progress: e.progress }));

  const featured = trending.data?.items.filter((m) => m.banner).slice(0, 8);
  const trendingGrid = trending.data?.items.slice(0, 12);

  return (
    <div className="pb-8">
      {trending.error ? (
        <div className="container-page pt-6">
          <ErrorState error={trending.error} onRetry={trending.refetch} />
        </div>
      ) : (
        <HeroCarousel items={featured} loading={trending.isLoading} />
      )}

      {reading.length > 0 && (
        <Section title="Bạn đang đọc" icon={BookOpenCheck} to="/library?status=READING" linkLabel="Tủ truyện">
          <MangaRow items={reading} getSubtitle={(m) => `Đã đọc tới ch. ${m._progress}${m.chapters ? ` / ${m.chapters}` : ''}`} />
        </Section>
      )}

      <Section title="Đang thịnh hành" icon={Flame} to="/browse?sort=TRENDING_DESC">
        <Block query={trending}>
          <MangaGrid items={trendingGrid} loading={trending.isLoading} />
        </Block>
      </Section>

      <Section title="Manhwa nổi bật" icon={Sparkles} to="/browse?country=KR&sort=TRENDING_DESC">
        <Block query={manhwa}>
          <MangaRow items={manhwa.data?.items} loading={manhwa.isLoading} />
        </Block>
      </Section>

      {meta?.genres && (
        <Section title="Thể loại" icon={Tags} to="/browse" linkLabel="Tìm nâng cao">
          <div className="flex flex-wrap gap-2">
            {meta.genres.map((g) => (
              <Link
                key={g}
                to={`/browse?genres=${encodeURIComponent(g)}`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition hover:border-brand-500 hover:text-brand-600 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {genreLabel(g)}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Phổ biến mọi thời đại" icon={Trophy} to="/browse?sort=POPULARITY_DESC">
        <Block query={popular}>
          <MangaRow items={popular.data?.items} loading={popular.isLoading} />
        </Block>
      </Section>

      <Section title="Điểm cao nhất" icon={Trophy} to="/browse?sort=SCORE_DESC">
        <Block query={topRated}>
          <MangaGrid items={topRated.data?.items} loading={topRated.isLoading} getMeta={(m, i) => `#${i + 1}`} />
        </Block>
      </Section>

      <Section title="Sắp ra mắt" icon={CalendarClock} to="/browse?status=NOT_YET_RELEASED">
        <Block query={upcoming}>
          <MangaRow items={upcoming.data?.items} loading={upcoming.isLoading} />
        </Block>
      </Section>
    </div>
  );
}
