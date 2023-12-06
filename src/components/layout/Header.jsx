import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';
import SearchBox from './SearchBox';
import { SLOGAN } from '../../lib/brand';

const NAV = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/browse', label: 'Khám phá' },
  { to: '/library', label: 'Tủ truyện' },
  { to: '/about', label: 'Giới thiệu' },
];

/**
 * Brand mark. `tagline`: 'always' | 'wide' (only on xl screens, used in the header) | undefined.
 */
export function Logo({ tagline }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label={`eManga – ${SLOGAN}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-black text-white shadow-sm shadow-brand-600/30 transition group-hover:rotate-[-6deg]">
        e
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight">
          e<span className="text-brand-600">Manga</span>
        </span>
        {tagline && (
          <span
            className={clsx(
              'mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400',
              tagline === 'wide' && 'hidden xl:block'
            )}
          >
            {SLOGAN}
          </span>
        )}
      </span>
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkCls = ({ isActive }) =>
    clsx(
      'rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
    );

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 border-b backdrop-blur-xl transition',
        scrolled
          ? 'border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/80'
          : 'border-transparent bg-white/60 dark:bg-zinc-950/60'
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Logo tagline="wide" />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Chính">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <SearchBox className="hidden w-56 sm:block lg:w-80" />
          <ThemeToggle />
          <button
            type="button"
            className="btn-ghost btn-icon md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container-page animate-fade-in pb-4 md:hidden" aria-label="Di động">
          <SearchBox className="mb-3 sm:hidden" />
          <div className="flex flex-col">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
