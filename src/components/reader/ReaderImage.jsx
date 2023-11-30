import { forwardRef, useState } from 'react';
import { ImageOff, RotateCw } from 'lucide-react';
import clsx from 'clsx';

const FIT = {
  width: 'w-full max-w-3xl h-auto',
  height: 'max-h-[calc(100vh-4rem)] w-auto',
  original: 'max-w-none',
};

/** Single page image with loading placeholder and retry on failure. */
const ReaderImage = forwardRef(function ReaderImage({ src, index, fit, eager, onLoad }, ref) {
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const url = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src;

  return (
    <div ref={ref} data-index={index} className="relative flex w-full justify-center">
      {state === 'loading' && (
        <div className="absolute inset-x-0 top-0 mx-auto grid aspect-[2/3] w-full max-w-3xl place-items-center bg-zinc-900 text-sm text-zinc-500">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
            Trang {index + 1}
          </div>
        </div>
      )}
      {state === 'error' ? (
        <div className="grid aspect-[2/3] w-full max-w-3xl place-items-center bg-zinc-900 text-zinc-400">
          <div className="flex flex-col items-center gap-3 text-sm">
            <ImageOff className="h-8 w-8" />
            Không tải được trang {index + 1}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setState('loading');
                setAttempt((a) => a + 1);
              }}
            >
              <RotateCw className="h-4 w-4" /> Thử lại
            </button>
          </div>
        </div>
      ) : (
        <img
          src={url}
          alt={`Trang ${index + 1}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
          onLoad={() => {
            setState('loaded');
            onLoad?.(index);
          }}
          onError={() => setState('error')}
          className={clsx(
            'select-none',
            FIT[fit],
            state === 'loading' && 'min-h-[60vh] opacity-0'
          )}
        />
      )}
    </div>
  );
});

export default ReaderImage;
