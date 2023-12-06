import { Link } from 'react-router-dom';
import { Facebook, Github, GraduationCap } from 'lucide-react';
import { Logo } from './Header';
import { SCHOOL, TEAM } from '../../lib/team';
import { PITCH } from '../../lib/brand';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Logo tagline="always" />
          <p className="max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{PITCH}</p>
          <a
            href="https://github.com/uit-ntn/emanga-fe"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-600 dark:text-zinc-400"
          >
            <Github className="h-4 w-4" /> uit-ntn/emanga-fe
          </a>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Điều hướng</h3>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link className="hover:text-brand-600" to="/browse">Khám phá</Link>
            </li>
            <li>
              <Link className="hover:text-brand-600" to="/library">Tủ truyện</Link>
            </li>
            <li>
              <Link className="hover:text-brand-600" to="/about">Giới thiệu</Link>
            </li>
          </ul>
        </div>

        <div className="sm:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Nhóm phát triển</h3>
          <ul className="space-y-3 text-sm">
            {TEAM.map((m) => (
              <li key={m.github} className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium">
                    {m.name}
                    <span className="ml-2 rounded-md bg-brand-600/10 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:text-brand-400">
                      {m.role}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                    {m.major} · {m.program}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <a
                    href={m.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-[#1877f2] dark:hover:bg-zinc-800"
                    aria-label={`Facebook của ${m.name}`}
                    title="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://github.com/${m.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                    aria-label={`GitHub của ${m.name}`}
                    title="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <GraduationCap className="h-4 w-4 shrink-0" />
            Cả hai đều là sinh viên {SCHOOL}.
          </p>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-5 text-center text-xs text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} eManga · Nguyễn Thanh Nhân &amp; Quãng Đại Thi. Dự án phi lợi nhuận.
      </div>
    </footer>
  );
}
