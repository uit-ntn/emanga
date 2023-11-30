import { ApiError } from './client';

/**
 * Reader backend (amplify/functions/reader-api). In development Vite serves it at /api;
 * in production VITE_READER_API points to the Lambda Function URL.
 */
export const READER_API = (import.meta.env.VITE_READER_API || '/api').replace(/\/$/, '');

async function get(path, signal) {
  let res;
  try {
    res = await fetch(`${READER_API}${path}`, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Không kết nối được máy chủ đọc truyện.', 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error || `Máy chủ đọc truyện lỗi (${res.status}).`, res.status);
  return body;
}

/** Find the readable source for an AniList manga. Resolves { id: string|null, languages: string[] }. */
export function lookupSource(manga, signal) {
  const params = new URLSearchParams({ anilistId: String(manga.id), title: manga.romaji || manga.title });
  const alt = [manga.title, manga.native].filter((t) => t && t !== manga.romaji);
  if (alt.length) params.set('alt', alt.join('|'));
  return get(`/lookup?${params}`, signal);
}

export async function getFeed(sourceId, lang, signal) {
  const data = await get(`/feed/${sourceId}?lang=${encodeURIComponent(lang)}`, signal);
  return data.chapters;
}

export async function getChapter(chapterId, { dataSaver = true } = {}, signal) {
  const data = await get(`/chapter/${chapterId}?quality=${dataSaver ? 'data-saver' : 'data'}`, signal);
  return { ...data, images: data.images.map((p) => `${READER_API}${p}`) };
}
