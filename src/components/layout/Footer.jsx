import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Logo } from './Header';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <Logo />
          <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            Khám phá manga, manhwa, manhua miễn phí, không quảng cáo, không cần tài khoản. Dữ liệu được cung cấp bởi{' '}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-600 hover:underline"
            >
              AniList
            </a>
            .
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Điều hướng</h3>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link className="hover:text-brand-600" to="/browse">Khám phá</Link>
            </li>
            <li>
              <Link className="hover:text-brand-600" to="/about">Giới thiệu</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Mã nguồn</h3>
          <a
            href="https://github.com/uit-ntn/emanga-fe"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-600 dark:text-zinc-400"
          >
            <Github className="h-4 w-4" /> uit-ntn/emanga-fe
          </a>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-5 text-center text-xs text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} eManga. Dự án phi lợi nhuận, không liên kết với AniList.
      </div>
    </footer>
  );
}
