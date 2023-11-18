import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import clsx from 'clsx';
import { useDebounce } from '../../hooks/useDebounce';
import { useMangaSearch } from '../../hooks/queries';
import { FORMATS } from '../../lib/constants';

/** Header search with instant suggestions. Ctrl/⌘+K or "/" to focus. */
export default function SearchBox({ className }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const listId = useId();

  const q = useDebounce(value.trim(), 300);
  const { data, isFetching } = useMangaSearch(
    { search: q, perPage: 6, sort: ['SEARCH_MATCH'] },
    { enabled: q.length >= 2 }
  );
  const results = q.length >= 2 ? data?.items ?? [] : [];

  useEffect(() => {
    setOpen(false);
    inputRef.current?.blur();
  }, [location.pathname, location.search]);

  useEffect(() => setActive(-1), [q]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && results[active]) {
      navigate(`/manga/${results[active].id}`);
    } else if (value.trim()) {
      navigate(`/browse?q=${encodeURIComponent(value.trim())}&sort=SEARCH_MATCH`);
    }
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && q.length >= 2;

  return (
    <div ref={wrapRef} className={clsx('relative', className)}>
      <form onSubmit={submit} role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Tìm manga..."
          className="input h-10 rounded-full bg-zinc-100 pl-9 pr-16 dark:bg-zinc-900 [&::-webkit-search-cancel-button]:hidden"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Tìm kiếm manga"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isFetching && q.length >= 2 && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
          {value ? (
            <button type="button" onClick={() => setValue('')} aria-label="Xoá" className="text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden rounded border border-zinc-300 px-1.5 text-[10px] font-medium text-zinc-400 lg:inline dark:border-zinc-700">
              Ctrl K
            </kbd>
          )}
        </div>
      </form>

      {showPanel && (
        <div className="card absolute inset-x-0 top-12 z-50 animate-fade-in overflow-hidden p-1 shadow-xl sm:left-auto sm:w-[26rem]">
          <ul id={listId} role="listbox">
            {results.map((m, i) => (
              <li key={m.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    navigate(`/manga/${m.id}`);
                    setValue('');
                  }}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl p-2 text-left',
                    i === active && 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                >
                  <img
                    src={m.coverSmall}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-14 w-10 shrink-0 rounded-md bg-zinc-200 object-cover dark:bg-zinc-800"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{m.title}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {[FORMATS[m.format], m.year, m.score ? `★ ${(m.score / 10).toFixed(1)}` : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {!isFetching && results.length === 0 && (
            <p className="p-4 text-center text-sm text-zinc-500">Không tìm thấy kết quả cho “{q}”</p>
          )}
          <button
            type="button"
            onClick={submit}
            className="mt-1 w-full rounded-xl p-2 text-center text-sm font-medium text-brand-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Xem tất cả kết quả
          </button>
        </div>
      )}
    </div>
  );
}
