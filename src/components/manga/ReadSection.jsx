import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle } from 'lucide-react';
import ChapterList from './ChapterList';
import { ErrorState, Skeleton } from '../ui/States';
import { useReaderFeed, useReaderSource } from '../../hooks/queries';
import { chapterTitle, firstReadable } from '../../lib/chapters';
import { useLibrary } from '../../store/library';
import { useSettings } from '../../store/settings';

const LANG_NAMES = {
  vi: 'Tiếng Việt',
  en: 'English',
  'es-la': 'Español (LATAM)',
  es: 'Español',
  fr: 'Français',
  'pt-br': 'Português (BR)',
  id: 'Bahasa Indonesia',
  th: 'ไทย',
  ru: 'Русский',
  de: 'Deutsch',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  'zh-hk': '中文 (HK)',
  tr: 'Türkçe',
  pl: 'Polski',
};

/**
 * "Đọc truyện" block on the detail page. Renders nothing when no readable source exists,
 * so the page falls back to the official platform links.
 */
export default function ReadSection({ manga }) {
  const source = useReaderSource(manga);
  const preferred = useSettings((s) => s.translatedLanguage);
  const entry = useLibrary((s) => s.entries[manga.id]);
  const [picked, setPicked] = useState(null);

  const languages = useMemo(() => {
    const avail = source.data?.languages ?? [];
    return [...preferred.filter((l) => avail.includes(l)), ...avail.filter((l) => !preferred.includes(l))];
  }, [source.data, preferred]);

  const lastLang = entry?.lastRead?.language;
  const lang = picked ?? (lastLang && languages.includes(lastLang) ? lastLang : languages[0]);
  const feed = useReaderFeed(source.data?.id, lang);
  const first = useMemo(() => firstReadable(feed.data), [feed.data]);

  if (source.isLoading) {
    return (
      <section>
        <Skeleton className="mb-4 h-7 w-40" />
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }
  // No source (or backend unreachable): hide quietly, official links remain below.
  if (source.error || !source.data?.id || !languages.length) return null;

  const last = entry?.lastRead;

  return (
    <section id="doc-truyen" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">
          Đọc truyện {feed.data && <span className="text-base font-medium text-zinc-500">({feed.data.length} chương)</span>}
        </h2>
        <select className="input w-auto" value={lang} onChange={(e) => setPicked(e.target.value)} aria-label="Ngôn ngữ bản dịch">
          {languages.map((l) => (
            <option key={l} value={l}>
              {LANG_NAMES[l] ?? l.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {last && (
          <Link to={`/manga/${manga.id}/chapter/${last.chapterId}`} className="btn-primary">
            <PlayCircle className="h-4 w-4" /> Đọc tiếp {chapterTitle(last)}
            {last.page > 0 ? ` · trang ${last.page + 1}` : ''}
          </Link>
        )}
        {first && (
          <Link to={`/manga/${manga.id}/chapter/${first.id}`} className={last ? 'btn-secondary' : 'btn-primary'}>
            <BookOpen className="h-4 w-4" /> Đọc từ {chapterTitle(first).toLowerCase()}
          </Link>
        )}
      </div>

      {feed.error ? (
        <ErrorState error={feed.error} onRetry={feed.refetch} />
      ) : (
        <ChapterList
          key={lang}
          chapters={feed.data}
          mangaId={manga.id}
          loading={feed.isLoading}
          progress={entry?.progress ?? 0}
          lastChapterId={last?.chapterId}
        />
      )}
      <p className="mt-3 text-xs text-zinc-500">
        Bản dịch từ cộng đồng qua{' '}
        <a href={`https://mangadex.org/title/${source.data.id}`} target="_blank" rel="noreferrer" className="underline hover:text-brand-600">
          MangaDex
        </a>
        . Cảm ơn các nhóm dịch, hãy ủng hộ tác giả khi truyện có bản chính thức.
      </p>
    </section>
  );
}
