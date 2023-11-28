/**
 * eManga reader API – framework-agnostic core.
 *
 * Runs server-side (AWS Lambda in production, Vite middleware in development) and talks to
 * the MangaDex API on behalf of the browser, which MangaDex does not allow to call it directly.
 *
 * Etiquette towards MangaDex:
 *  - identifies itself with an honest User-Agent
 *  - only whitelisted, read-only endpoints are exposed
 *  - upstream requests are rate limited and responses cached
 *  - the UI credits MangaDex and the scanlation groups
 *
 * handle(path, query) -> { status, headers, body }   (body: string | Buffer)
 */

const API = 'https://api.mangadex.org';
export const USER_AGENT = 'eManga/1.0 (+https://github.com/uit-ntn/emanga-fe)';
const ALL_RATINGS = ['safe', 'suggestive', 'erotica'];
const MAX_IMAGE_BYTES = 5.5 * 1024 * 1024; // Lambda response limit is 6 MB

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANG = /^[a-z]{2}(-[a-z]{2})?$/;

export function isAllowedImageUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    return u.hostname === 'uploads.mangadex.org' || /^[a-z0-9-]+\.mangadex\.network$/i.test(u.hostname);
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------------- cache */

const cache = new Map();
const MAX_CACHE = 500;

async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;
  const value = await fn();
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
  cache.set(key, { value, exp: Date.now() + ttlMs });
  return value;
}

export function clearCache() {
  cache.clear();
}

/* ------------------------------------------------------- rate limiting */

// MangaDex allows ~5 req/s per IP; stay below that.
const MIN_INTERVAL = 220;
let nextSlot = 0;
async function throttle() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + MIN_INTERVAL;
  if (wait) await new Promise((r) => setTimeout(r, wait));
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((x) => sp.append(`${k}[]`, x));
    else if (typeof v === 'object') Object.entries(v).forEach(([kk, vv]) => sp.append(`${k}[${kk}]`, vv));
    else sp.append(k, String(v));
  });
  return sp.toString();
}

async function mdx(path, params = {}) {
  await throttle();
  const res = await fetch(`${API}${path}?${qs(params)}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (res.status === 404) throw new HttpError(404, 'Không tìm thấy nội dung.');
  if (res.status === 429) throw new HttpError(503, 'Nguồn truyện đang quá tải, thử lại sau ít phút.');
  if (!res.ok) throw new HttpError(502, `Nguồn truyện lỗi (${res.status}).`);
  return res.json();
}

/* ---------------------------------------------------------- normalizers */

const relNames = (item, type) =>
  (item.relationships || []).filter((r) => r.type === type && r.attributes?.name).map((r) => r.attributes.name);

function chapterDto(item) {
  const a = item.attributes;
  return {
    id: item.id,
    chapter: a.chapter,
    volume: a.volume,
    title: a.title,
    language: a.translatedLanguage,
    pages: a.pages,
    externalUrl: a.externalUrl,
    readableAt: a.readableAt,
    groups: relNames(item, 'scanlation_group'),
    mangadexId: (item.relationships || []).find((r) => r.type === 'manga')?.id,
  };
}

/* -------------------------------------------------------------- routes */

/** Find the MangaDex entry for an AniList id (MangaDex stores it in links.al). */
async function lookup({ anilistId, title, alt }) {
  if (!/^\d+$/.test(anilistId || '')) throw new HttpError(400, 'anilistId không hợp lệ');
  if (!title) throw new HttpError(400, 'Thiếu title');
  const titles = [title, ...(alt ? String(alt).split('|') : [])].filter(Boolean).slice(0, 3);

  return cached(`lookup:${anilistId}`, 24 * 3600e3, async () => {
    for (const t of titles) {
      const res = await mdx('/manga', { title: t.slice(0, 100), limit: 20, contentRating: ALL_RATINGS, order: { relevance: 'desc' } });
      const match = res.data.find((m) => String(m.attributes.links?.al) === String(anilistId));
      if (match) {
        return {
          id: match.id,
          languages: match.attributes.availableTranslatedLanguages?.filter(Boolean) ?? [],
        };
      }
    }
    return { id: null, languages: [] };
  });
}

async function feed(mangadexId, { lang }) {
  if (!UUID.test(mangadexId)) throw new HttpError(400, 'id không hợp lệ');
  if (lang && !LANG.test(lang)) throw new HttpError(400, 'lang không hợp lệ');

  return cached(`feed:${mangadexId}:${lang || '*'}`, 10 * 60e3, async () => {
    const chapters = [];
    let offset = 0;
    let total = Infinity;
    while (offset < total && offset < 3000) {
      const res = await mdx(`/manga/${mangadexId}/feed`, {
        limit: 500,
        offset,
        translatedLanguage: lang ? [lang] : undefined,
        order: { volume: 'desc', chapter: 'desc' },
        includes: ['scanlation_group'],
        contentRating: ALL_RATINGS,
        includeEmptyPages: 0,
        includeFutureUpdates: 0,
      });
      chapters.push(...res.data.map(chapterDto));
      total = res.total;
      offset += res.limit;
    }
    return { chapters };
  });
}

async function chapter(id, { quality }) {
  if (!UUID.test(id)) throw new HttpError(400, 'id không hợp lệ');
  const q = quality === 'data' ? 'data' : 'data-saver';

  return cached(`chapter:${id}:${q}`, 5 * 60e3, async () => {
    const info = await mdx(`/chapter/${id}`, { includes: ['scanlation_group'] });
    const dto = chapterDto(info.data);
    if (dto.externalUrl) return { ...dto, images: [] };

    const home = await mdx(`/at-home/server/${id}`);
    const files = q === 'data' ? home.chapter.data : home.chapter.dataSaver;
    const images = files.map(
      (f) => `/image?u=${encodeURIComponent(`${home.baseUrl}/${q}/${home.chapter.hash}/${f}`)}`
    );
    return { ...dto, images };
  });
}

async function image({ u }) {
  if (!u || !isAllowedImageUrl(u)) throw new HttpError(400, 'URL ảnh không được phép');
  const res = await fetch(u, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new HttpError(502, `Không tải được ảnh (${res.status})`);
  const len = Number(res.headers.get('content-length') || 0);
  if (len > MAX_IMAGE_BYTES) throw new HttpError(413, 'Ảnh quá lớn, hãy dùng chế độ tiết kiệm dữ liệu');
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Ảnh quá lớn, hãy dùng chế độ tiết kiệm dữ liệu');
  return { contentType: res.headers.get('content-type') || 'image/jpeg', buf };
}

/* -------------------------------------------------------------- router */

const json = (status, data, maxAge = 0) => ({
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store',
  },
  body: JSON.stringify(data),
});

export async function handle(path, query = {}) {
  const parts = path.replace(/^\/+|\/+$/g, '').split('/');
  try {
    switch (parts[0]) {
      case 'lookup':
        return json(200, await lookup(query), 3600);
      case 'feed':
        return json(200, await feed(parts[1], query), 300);
      case 'chapter':
        return json(200, await chapter(parts[1], query), 120);
      case 'image': {
        const { contentType, buf } = await image(query);
        return {
          status: 200,
          headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=604800, immutable' },
          body: buf,
        };
      }
      case 'health':
        return json(200, { ok: true });
      default:
        return json(404, { error: 'Không có endpoint này' });
    }
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    return json(status, { error: status === 500 ? 'Lỗi máy chủ' : err.message });
  }
}
