import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import Cover from '../ui/Cover';
import { Skeleton } from '../ui/States';
import { STATUS } from '../../lib/constants';

function stripMarkdown(text = '') {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>`]/g, '')
    .split(/\n-{3,}|\n\n/)[0];
}

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
  return (
    <div className="container-page pt-6">
      <div
        className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* blurred backdrop */}
        <div
          key={m.id + '-bg'}
          className="absolute inset-0 animate-fade-in scale-110 bg-cover bg-center opacity-40 blur-2xl"
          style={{ backgroundImage: m.cover ? `url(${m.cover})` : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

        <div key={m.id} className="relative flex min-h-[340px] animate-fade-in items-center gap-8 p-6 sm:min-h-[400px] sm:p-10">
          <div className="max-w-xl flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
              #{index + 1} Nổi bật
            </p>
            <h1 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight sm:text-4xl">{m.title}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STATUS[m.status] && (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
                  {STATUS[m.status].label}
                </span>
              )}
              {m.tags
                .filter((t) => t.group === 'genre')
                .slice(0, 4)
                .map((t) => (
                  <span key={t.id} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-zinc-300">
                    {t.name}
                  </span>
                ))}
            </div>
            <p className="mt-4 line-clamp-3 text-sm text-zinc-300 sm:text-base">{stripMarkdown(m.description)}</p>
            {m.authors.length > 0 && <p className="mt-3 text-sm text-zinc-400">{m.authors.join(', ')}</p>}
            <div className="mt-6 flex gap-3">
              <Link to={`/manga/${m.id}`} className="btn-primary">
                <BookOpen className="h-4 w-4" /> Đọc ngay
              </Link>
            </div>
          </div>
          <Link to={`/manga/${m.id}`} className="hidden w-48 shrink-0 md:block lg:w-56">
            <Cover src={m.cover} alt={m.title} eager className="shadow-2xl ring-1 ring-white/10" />
          </Link>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-6 sm:right-6">
          <button type="button" onClick={() => go(-1)} className="btn-icon btn rounded-full bg-white/10 hover:bg-white/20" aria-label="Trước">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} className="btn-icon btn rounded-full bg-white/10 hover:bg-white/20" aria-label="Sau">
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
