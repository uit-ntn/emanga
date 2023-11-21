import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ExternalLink, Eye, EyeOff, Heart, Share2, Star, TrendingUp, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { MangaRow } from '../components/manga/MangaGrid';
import Cover from '../components/ui/Cover';
import RichText from '../components/ui/RichText';
import { ErrorState, Skeleton } from '../components/ui/States';
import { useManga } from '../hooks/queries';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { COUNTRIES, FORMATS, RELATION_LABELS, ROLE_LABELS, SOURCE_LABELS, STATUS, genreLabel } from '../lib/constants';
import { formatNumber } from '../lib/format';
import { ProgressCard, TrackButton } from '../components/manga/TrackerPanel';

function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-56 w-full rounded-none sm:h-72" />
      <div className="container-page -mt-24 flex flex-col gap-6 sm:flex-row">
        <Skeleton className="aspect-[2/3] w-44 rounded-2xl sm:w-56" />
        <div className="flex-1 space-y-3 sm:pt-28">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-72" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  if (children === null || children === undefined || children === '' || (Array.isArray(children) && !children.length)) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function Stat({ icon: Icon, children, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5', className)}>
      <Icon className="h-4 w-4" /> {children}
    </span>
  );
}

function PersonCard({ person, subtitle }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
      <img
        src={person.image}
        alt=""
        loading="lazy"
        className="h-14 w-11 shrink-0 rounded-lg bg-zinc-200 object-cover dark:bg-zinc-800"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{person.name}</p>
        <p className="truncate text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ScoreChart({ data }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex h-28 items-end gap-1" role="img" aria-label="Phân bố điểm">
      {data.map((d) => (
        <div key={d.score} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-gradient-to-t from-brand-600 to-brand-400"
            style={{ height: `${Math.max((d.amount / max) * 88, 2)}px`, opacity: 0.35 + (d.score / 100) * 0.65 }}
            title={`${d.score}: ${formatNumber(d.amount)} người`}
          />
          <span className="text-[10px] text-zinc-500">{d.score}</span>
        </div>
      ))}
    </div>
  );
}

export default function MangaDetail() {
  const { id } = useParams();
  const { data: manga, isLoading, error, refetch } = useManga(id);
  const [expanded, setExpanded] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [copied, setCopied] = useState(false);

  useDocumentTitle(manga?.title);

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
      /* cancelled */
    }
  };

  const status = STATUS[manga.status];
  const readLinks = manga.links.filter((l) => l.type === 'STREAMING');
  const infoLinks = manga.links.filter((l) => l.type !== 'STREAMING');
  const tags = manga.tags.filter((t) => showSpoilers || !t.spoiler);
  const spoilerCount = manga.tags.filter((t) => t.spoiler).length;
  const authors = manga.staff.filter((s) => /story|art/i.test(s.role));
  const rated = manga.rankings.find((r) => r.type === 'RATED');
  const popular = manga.rankings.find((r) => r.type === 'POPULAR');

  return (
    <div>
      {/* Banner */}
      <div className="relative h-56 overflow-hidden sm:h-80">
        {manga.banner ? (
          <img src={manga.banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-2xl dark:opacity-40"
            style={{ backgroundImage: manga.cover ? `url(${manga.cover})` : undefined, backgroundColor: manga.color }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-50/40 to-zinc-50 dark:via-zinc-950/50 dark:to-zinc-950" />
      </div>

      <div className="container-page relative -mt-32 sm:-mt-40">
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="mx-auto w-44 shrink-0 sm:mx-0 sm:w-56">
            <Cover src={manga.cover} alt={manga.title} color={manga.color} eager className="shadow-2xl ring-1 ring-black/10" />
          </div>

          <div className="min-w-0 flex-1 text-center sm:pt-28 sm:text-left">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{manga.title}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {[...new Set([manga.romaji, manga.native].filter((t) => t && t.toLowerCase() !== manga.title.toLowerCase()))].join(' · ')}
            </p>
            {authors.length > 0 && (
              <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {[...new Set(authors.map((a) => a.name))].join(', ')}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500 sm:justify-start">
              {manga.score ? (
                <Stat icon={Star} className="font-semibold text-zinc-900 dark:text-zinc-100 [&>svg]:fill-amber-400 [&>svg]:text-amber-400">
                  {(manga.score / 10).toFixed(1)}
                </Stat>
              ) : null}
              {manga.popularity ? <Stat icon={TrendingUp}>{formatNumber(manga.popularity)} người đọc</Stat> : null}
              {manga.favourites ? <Stat icon={Heart}>{formatNumber(manga.favourites)} yêu thích</Stat> : null}
              {status && (
                <span className="inline-flex items-center gap-1.5">
                  <span className={clsx('h-2 w-2 rounded-full', status.color)} />
                  {status.label}
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
              {readLinks[0] && (
                <a href={readLinks[0].url} target="_blank" rel="noreferrer" className="btn-primary">
                  <BookOpen className="h-4 w-4" /> Đọc trên {readLinks[0].site}
                </a>
              )}
              <TrackButton manga={manga} />
              <button type="button" onClick={share} className="btn-secondary">
                <Share2 className="h-4 w-4" /> {copied ? 'Đã sao chép!' : 'Chia sẻ'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-10">
            {manga.description && (
              <section>
                <h2 className="section-title mb-3">Giới thiệu</h2>
                <RichText
                  text={manga.description}
                  className={clsx('prose-desc text-sm leading-relaxed text-zinc-700 dark:text-zinc-300', !expanded && 'line-clamp-6')}
                />
                {manga.description.length > 400 && (
                  <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-2 text-sm font-semibold text-brand-600 hover:underline">
                    {expanded ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                )}
              </section>
            )}

            {readLinks.length > 0 && (
              <section>
                <h2 className="section-title mb-1">Đọc ở đâu?</h2>
                <p className="mb-4 text-sm text-zinc-500">Ủng hộ tác giả bằng cách đọc trên các nền tảng chính thức.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {readLinks.map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="card flex items-center gap-3 p-3 transition hover:border-brand-500"
                    >
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                        style={{ backgroundColor: l.color || '#e11d48' }}
                      >
                        {l.icon ? <img src={l.icon} alt="" className="h-5 w-5" /> : <BookOpen className="h-5 w-5 text-white" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{l.site}</span>
                        {l.language && <span className="block text-xs text-zinc-500">{l.language}</span>}
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-zinc-400" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {manga.characters.length > 0 && (
              <section>
                <h2 className="section-title mb-4">Nhân vật</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {manga.characters.map((c) => (
                    <PersonCard key={c.id} person={c} subtitle={ROLE_LABELS[c.role] ?? c.role} />
                  ))}
                </div>
              </section>
            )}

            {manga.relations.length > 0 && (
              <section>
                <h2 className="section-title mb-4">Liên quan</h2>
                <MangaRow
                  items={manga.relations.map((r) => r.manga)}
                  getSubtitle={(m) => RELATION_LABELS[manga.relations.find((r) => r.manga.id === m.id)?.type] ?? ''}
                />
              </section>
            )}

            {manga.recommendations.length > 0 && (
              <section>
                <h2 className="section-title mb-4">Có thể bạn sẽ thích</h2>
                <MangaRow items={manga.recommendations} />
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <ProgressCard manga={manga} />
            {(rated || popular) && (
              <div className="card space-y-2 p-4 text-sm">
                {rated && (
                  <p className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" /> #{rated.rank} điểm cao nhất mọi thời đại
                  </p>
                )}
                {popular && (
                  <p className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-brand-500" /> #{popular.rank} phổ biến nhất mọi thời đại
                  </p>
                )}
              </div>
            )}

            <dl className="card space-y-4 p-5">
              <InfoRow label="Định dạng">{FORMATS[manga.format] ?? manga.format}</InfoRow>
              <InfoRow label="Quốc gia">{COUNTRIES[manga.country] ?? manga.country}</InfoRow>
              <InfoRow label="Số chương">{manga.chapters}</InfoRow>
              <InfoRow label="Số tập">{manga.volumes}</InfoRow>
              <InfoRow label="Bắt đầu">{manga.startDate}</InfoRow>
              <InfoRow label="Kết thúc">{manga.endDate}</InfoRow>
              <InfoRow label="Nguồn">{SOURCE_LABELS[manga.source] ?? manga.source}</InfoRow>
              <InfoRow label="Đội ngũ">
                {manga.staff.length > 0 && (
                  <ul className="space-y-1">
                    {manga.staff.map((s) => (
                      <li key={`${s.id}-${s.role}`}>
                        {s.name} <span className="text-zinc-500">· {ROLE_LABELS[s.role] ?? s.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </InfoRow>
              <InfoRow label="Tên khác">{manga.synonyms.length > 0 && manga.synonyms.slice(0, 5).join(' · ')}</InfoRow>
            </dl>

            {manga.genres.length > 0 && (
              <div className="card p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Thể loại</h3>
                <div className="flex flex-wrap gap-1.5">
                  {manga.genres.map((g) => (
                    <Link
                      key={g}
                      to={`/browse?genres=${encodeURIComponent(g)}`}
                      className="rounded-lg bg-brand-600/10 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white dark:text-brand-400"
                    >
                      {genreLabel(g)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {manga.tags.length > 0 && (
              <div className="card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Thẻ</h3>
                  {spoilerCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSpoilers((v) => !v)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-brand-600"
                    >
                      {showSpoilers ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showSpoilers ? 'Ẩn spoiler' : `Hiện ${spoilerCount} spoiler`}
                    </button>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {tags.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/browse?tags=${encodeURIComponent(t.name)}`}
                        title={t.description}
                        className={clsx(
                          'flex items-center justify-between rounded-lg px-2 py-1 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800',
                          t.spoiler && 'text-rose-600 dark:text-rose-400'
                        )}
                      >
                        <span>{t.name}</span>
                        <span className="text-xs text-zinc-400">{t.rank}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {manga.scoreDistribution.length > 0 && (
              <div className="card p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Phân bố điểm</h3>
                <ScoreChart data={manga.scoreDistribution} />
              </div>
            )}

            <div className="card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Liên kết</h3>
              <ul className="space-y-1.5 text-sm">
                {infoLinks.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400">
                      {l.site} {l.language ? `(${l.language})` : ''} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
                <li>
                  <a href={manga.siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400">
                    AniList <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
