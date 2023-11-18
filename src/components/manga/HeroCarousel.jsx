import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import clsx from 'clsx';
import Cover from '../ui/Cover';
import { Skeleton } from '../ui/States';
import { ScoreBadge } from './MangaCard';
import { STATUS, genreLabel } from '../../lib/constants';
import { plainText } from '../../lib/normalize';

export default function HeroCarousel({ items, loading }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items?.length ?? 0;

  const go = useCallback((dir) => setIndex((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    if (!count || paused) return undefined;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [count, paused, go]);

  if (loading || !count) {
    return (
      <div className="container-page pt-6">
        <Skeleton className="h-[340px] w-full rounded-3xl sm:h-[400px]" />
      </div>
    );
  }

  const m = items[index];
  const backdrop = m.banner || m.cover;
  return (
    <div className="container-page pt-6">
      <div
        className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          key={m.id + '-bg'}
          className={clsx(
            'absolute inset-0 animate-fade-in bg-cover bg-center',
            m.banner ? 'opacity-50' : 'scale-110 opacity-40 blur-2xl'
          )}
          style={{ backgroundImage: backdrop ? `url(${backdrop})` : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/10" />

        <div key={m.id} className="relative flex min-h-[340px] animate-fade-in items-center gap-8 p-6 sm:min-h-[400px] sm:p-10">
          <div className="max-w-xl flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">#{index + 1} Thịnh hành</p>
            <h1 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight sm:text-4xl">{m.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <ScoreBadge score={m.score} className="bg-white/15" />
              {STATUS[m.status] && (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">{STATUS[m.status].label}</span>
              )}
              {m.genres.slice(0, 4).map((g) => (
                <span key={g} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-zinc-300">
                  {genreLabel(g)}
                </span>
              ))}
            </div>
            <p className="mt-4 line-clamp-3 text-sm text-zinc-300 sm:text-base">{plainText(m.description)}</p>
            <div className="mt-6 flex gap-3">
              <Link to={`/manga/${m.id}`} className="btn-primary">
                <Info className="h-4 w-4" /> Xem chi tiết
              </Link>
            </div>
          </div>
          <Link to={`/manga/${m.id}`} className="hidden w-48 shrink-0 md:block lg:w-56">
            <Cover src={m.cover} alt={m.title} color={m.color} eager className="shadow-2xl ring-1 ring-white/10" />
          </Link>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-6 sm:right-6">
          <button type="button" onClick={() => go(-1)} className="btn btn-icon rounded-full bg-white/10 hover:bg-white/20" aria-label="Trước">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} className="btn btn-icon rounded-full bg-white/10 hover:bg-white/20" aria-label="Sau">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 hidden gap-1.5 sm:flex">
          {items.map((it, i) => (
            <button
              type="button"
              key={it.id}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={clsx('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/40')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
