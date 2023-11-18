import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import clsx from 'clsx';

/** Manga cover with 2:3 ratio, lazy loading, dominant-color placeholder and fallback. */
export default function Cover({ src, alt, color, className, eager = false, rounded = 'rounded-xl' }) {
  const [state, setState] = useState(src ? 'loading' : 'error');

  return (
    <div
      className={clsx('relative aspect-[2/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800', rounded, className)}
      style={color && state !== 'loaded' ? { backgroundColor: color } : undefined}
    >
      {state === 'loading' && <div className="absolute inset-0 animate-pulse bg-white/10" />}
      {state === 'error' ? (
        <div className="absolute inset-0 grid place-items-center text-zinc-400">
          <ImageOff className="h-8 w-8" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={clsx(
            'h-full w-full object-cover transition duration-500',
            state === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}
