import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import Cover from '../ui/Cover';
import { Skeleton } from '../ui/States';
import { COUNTRIES, STATUS } from '../../lib/constants';

export function ScoreBadge({ score, className }) {
  if (!score) return null;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur',
        className
      )}
    >
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      {(score / 10).toFixed(1)}
    </span>
  );
}

export default function MangaCard({ manga, subtitle, meta, className }) {
  const status = STATUS[manga.status];
  const country = manga.country && manga.country !== 'JP' ? COUNTRIES[manga.country]?.split(' ')[0] : null;
  return (
    <Link to={`/manga/${manga.id}`} className={clsx('group block animate-fade-in', className)} title={manga.title}>
      <div className="relative">
        <Cover
          src={manga.coverSmall}
          alt={manga.title}
          color={manga.color}
          className="shadow-sm ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:ring-white/5"
        />
        <ScoreBadge score={manga.score} className="absolute left-2 top-2" />
        {(meta || country) && (
          <span className="absolute bottom-2 right-2 rounded-lg bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
            {meta || country}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-brand-600">
          {manga.title}
        </h3>
        {subtitle ? (
          <p className="truncate text-xs text-zinc-500">{subtitle}</p>
        ) : (
          status && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className={clsx('h-1.5 w-1.5 rounded-full', status.color)} />
              {status.label}
              {manga.year ? ` · ${manga.year}` : ''}
            </p>
          )
        )}
      </div>
    </Link>
  );
}

export function MangaCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-1.5 h-3 w-1/2" />
    </div>
  );
}
