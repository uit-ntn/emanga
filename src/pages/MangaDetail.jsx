import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, Bookmark, BookmarkCheck, ExternalLink, Heart, PlayCircle, Share2, Star } from 'lucide-react';
import clsx from 'clsx';
import ChapterList from '../components/manga/ChapterList';
import Cover from '../components/ui/Cover';
import RichText from '../components/ui/RichText';
import { ErrorState, Skeleton } from '../components/ui/States';
import { useManga, useMangaFeed, useStatistics } from '../hooks/queries';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { DEMOGRAPHICS, LANGUAGES, STATUS } from '../lib/constants';
import { formatNumber, formatRating } from '../lib/format';
import { toggleFollow, useLibrary } from '../store/library';
import { useSettings } from '../store/settings';

const EXTERNAL_LINKS = {
  al: { label: 'AniList', url: (v) => `https://anilist.co/manga/${v}` },
  mal: { label: 'MyAnimeList', url: (v) => `https://myanimelist.net/manga/${v}` },
  mu: { label: 'MangaUpdates', url: (v) => `https://www.mangaupdates.com/series.html?id=${v}` },
  raw: { label: 'Bản gốc', url: (v) => v },
  engtl: { label: 'Bản tiếng Anh chính thức', url: (v) => v },
  amz: { label: 'Amazon', url: (v) => v },
};

function DetailSkeleton() {
  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <Skeleton className="aspect-[2/3] w-48 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

function Meta({ label, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default function MangaDetail() {
  const { id } = useParams();
  const { data: manga, isLoading, error, refetch } = useManga(id);
  const { data: statsMap } = useStatistics(id ? [id] : []);
  const stats = statsMap?.[id];
  const preferred = useSettings((s) => s.translatedLanguage);
  const isFollowed = useLibrary((s) => Boolean(s.follows[id]));
  const history = useLibrary((s) => s.history[id]);
  const [lang, setLang] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useDocumentTitle(manga?.title);

  const languages = useMemo(() => {
    const available = manga?.availableLanguages ?? [];
    return [...preferred.filter((l) => available.includes(l)), ...available.filter((l) => !preferred.includes(l))];
  }, [manga, preferred]);

  const activeLang = lang ?? (history?.language && languages.includes(history.language) ? history.language : languages[0]);
  const feed = useMangaFeed(manga && activeLang ? id : null, activeLang ? [activeLang] : undefined);

  const readable = useMemo(() => (feed.data ?? []).filter((c) => !c.externalUrl), [feed.data]);
  const firstChapter = useMemo(() => {
    if (!readable.length) return null;
    return readable.reduce((min, c) => (parseFloat(c.chapter ?? 0) < parseFloat(min.chapter ?? 0) ? c : min));
  }, [readable]);

  if (isLoading) return <DetailSkeleton />;
  if (error) {
    return (
      <div className="container-page py-12">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: manga.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled */
    }
  };

  const status = STATUS[manga.status];
  const genres = manga.tags.filter((t) => t.group === 'genre' || t.group === 'theme');
  const links = Object.entries(manga.links).filter(([k]) => EXTERNAL_LINKS[k]);

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-56 overflow-hidden sm:h-72">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-2xl dark:opacity-40"
          style={{ backgroundImage: manga.cover ? `url(${manga.cover})` : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-50/60 to-zinc-50 dark:via-zinc-950/60 dark:to-zinc-950" />
      </div>

      <div className="container-page relative -mt-40 sm:-mt-52">
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="mx-auto w-44 shrink-0 sm:mx-0 sm:w-56">
            <Cover src={manga.cover} alt={manga.title} eager className="shadow-2xl ring-1 ring-black/10" />
          </div>

          <div className="min-w-0 flex-1 text-center sm:pt-16 sm:text-left">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{manga.title}</h1>
            {manga.altTitles.length > 0 && (
              <p className="mt-2 line-clamp-1 text-sm text-zinc-500" title={manga.altTitles.join(' · ')}>
                {manga.altTitles.slice(0, 3).join(' · ')}
              </p>
            )}
            <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {[...new Set([...manga.authors, ...manga.artists])].join(', ')}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:justify-start">
              {stats?.rating ? (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {formatRating(stats.rating)}
                </span>
              ) : null}
              {stats && (
                <span className="inline-flex items-center gap-1 text-zinc-500">
                  <Heart className="h-4 w-4" /> {formatNumber(stats.follows)} theo dõi
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <span className={clsx('h-2 w-2 rounded-full', status.color)} />
                  {status.label}
                </span>
              )}
              {manga.year && <span className="text-zinc-500">{manga.year}</span>}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
              {history ? (
                <Link to={`/manga/${id}/chapter/${history.chapterId}`} className="btn-primary">
                  <PlayCircle className="h-4 w-4" /> Đọc tiếp {history.chapter ? `Ch. ${history.chapter}` : ''}
                </Link>
              ) : firstChapter ? (
                <Link to={`/manga/${id}/chapter/${firstChapter.id}`} className="btn-primary">
                  <BookOpen className="h-4 w-4" /> Đọc từ đầu
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => toggleFollow(manga)}
                className={clsx(isFollowed ? 'btn-secondary text-brand-600 dark:text-brand-400' : 'btn-secondary')}
                aria-pressed={isFollowed}
              >
                {isFollowed ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
              </button>
              <button type="button" onClick={share} className="btn-secondary">
                <Share2 className="h-4 w-4" /> {copied ? 'Đã sao chép!' : 'Chia sẻ'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-8">
            {manga.description && (
              <section>
                <h2 className="section-title mb-3">Giới thiệu</h2>
                <div className="relative">
                  <RichText
                    text={manga.description}
                    className={clsx(
                      'prose-desc text-sm leading-relaxed text-zinc-700 dark:text-zinc-300',
                      !expanded && 'line-clamp-5'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-2 text-sm font-semibold text-brand-600 hover:underline"
                  >
                    {expanded ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="section-title">
                  Danh sách chương{' '}
                  {feed.data && <span className="text-base font-medium text-zinc-500">({feed.data.length})</span>}
                </h2>
                {languages.length > 0 && (
                  <select
                    className="input w-auto"
                    value={activeLang}
                    onChange={(e) => setLang(e.target.value)}
                    aria-label="Ngôn ngữ"
                  >
                    {languages.map((l) => (
                      <option key={l} value={l}>
                        {LANGUAGES[l] ?? l.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {feed.error ? (
                <ErrorState error={feed.error} onRetry={feed.refetch} />
              ) : (
                <ChapterList
                  key={activeLang}
                  chapters={languages.length ? feed.data : []}
                  mangaId={id}
                  loading={feed.isLoading && languages.length > 0}
                />
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <dl className="card space-y-4 p-5">
              <Meta label="Tác giả">{manga.authors.join(', ')}</Meta>
              <Meta label="Hoạ sĩ">{manga.artists.join(', ')}</Meta>
              <Meta label="Đối tượng">{manga.demographic && DEMOGRAPHICS[manga.demographic]}</Meta>
              <Meta label="Ngôn ngữ gốc">{LANGUAGES[manga.originalLanguage] ?? manga.originalLanguage}</Meta>
              {genres.length > 0 && (
                <Meta label="Thể loại">
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((t) => (
                      <Link
                        key={t.id}
                        to={`/browse?tags=${t.id}`}
                        className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium transition hover:bg-brand-600 hover:text-white dark:bg-zinc-800"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </Meta>
              )}
              {links.length > 0 && (
                <Meta label="Liên kết">
                  <ul className="space-y-1.5">
                    {links.map(([k, v]) => (
                      <li key={k}>
                        <a
                          href={EXTERNAL_LINKS[k].url(v)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {EXTERNAL_LINKS[k].label} <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href={`https://mangadex.org/title/${id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400"
                      >
                        MangaDex <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  </ul>
                </Meta>
              )}
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
