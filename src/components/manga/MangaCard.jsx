import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import Cover from '../ui/Cover';
import { Skeleton } from '../ui/States';
import { STATUS } from '../../lib/constants';
import { formatRating } from '../../lib/format';

export default function MangaCard({ manga, stats, subtitle, meta, className }) {
  const status = STATUS[manga.status];
  return (
    <Link to={`/manga/${manga.id}`} className={clsx('group block animate-fade-in', className)} title={manga.title}>
      <div className="relative">
        <Cover
          src={manga.coverSmall}
          alt={manga.title}
          className="shadow-sm ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:ring-white/5"
        />
        {stats?.rating ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {formatRating(stats.rating)}
          </span>
        ) : null}
        {meta && (
          <span className="absolute bottom-2 right-2 rounded-lg bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
            {meta}
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
