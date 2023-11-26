import { Link } from 'react-router-dom';
import { Facebook, Github, GraduationCap } from 'lucide-react';
import { Logo } from './Header';
import { SCHOOL, TEAM } from '../../lib/team';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <Logo />
          <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            Khám phá manga, manhwa, manhua miễn phí, không quảng cáo, không cần tài khoản. Dữ liệu được cung cấp bởi{' '}
            <a href="https://anilist.co" target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
              AniList
            </a>
            .
          </p>
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
              <li key={m.github} className="flex items-center justify-between gap-3">
                <span className="font-medium">{m.name}</span>
                <span className="flex items-center gap-1">
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
        © {new Date().getFullYear()} eManga · Nguyễn Thanh Nhân &amp; Quãng Đại Thi. Dự án phi lợi nhuận, không liên kết với AniList.
      </div>
    </footer>
  );
}
