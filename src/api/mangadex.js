import { request } from './client';
import { normalizeChapter, normalizeManga } from '../lib/normalize';

const MANGA_INCLUDES = ['cover_art', 'author', 'artist'];
const ALL_RATINGS = ['safe', 'suggestive', 'erotica', 'pornographic'];

function toPage(res, map) {
  return {
    items: res.data.map(map),
    total: res.total,
    limit: res.limit,
    offset: res.offset,
  };
}

/** Search / list manga. All filters are optional. */
export async function searchManga(
  {
    title,
    limit = 24,
    offset = 0,
    order = { followedCount: 'desc' },
    includedTags,
    excludedTags,
    status,
    publicationDemographic,
    contentRating = ['safe', 'suggestive'],
    availableTranslatedLanguage,
    year,
    ids,
  } = {},
  signal
) {
  const res = await request('/manga', {
    signal,
    params: {
      title,
      limit,
      offset,
      order,
      includedTags,
      includedTagsMode: 'AND',
      excludedTags,
      status,
      publicationDemographic,
      contentRating,
      availableTranslatedLanguage,
      year,
      ids,
      hasAvailableChapters: ids ? undefined : 'true',
      includes: MANGA_INCLUDES,
    },
  });
  return toPage(res, normalizeManga);
}

export async function getManga(id, signal) {
  const res = await request(`/manga/${id}`, { signal, params: { includes: MANGA_INCLUDES } });
  return normalizeManga(res.data);
}

/** Returns a map: mangaId -> { rating, follows, comments } */
export async function getStatistics(ids, signal) {
  if (!ids?.length) return {};
  const res = await request('/statistics/manga', { signal, params: { manga: ids } });
  const out = {};
  Object.entries(res.statistics || {}).forEach(([id, s]) => {
    out[id] = {
      rating: s.rating?.bayesian ?? s.rating?.average ?? null,
      follows: s.follows ?? 0,
      comments: s.comments?.repliesCount ?? 0,
    };
  });
  return out;
}

export async function getTags(signal) {
  const res = await request('/manga/tag', { signal });
  return res.data
    .map((t) => ({ id: t.id, name: t.attributes.name.en, group: t.attributes.group }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Full chapter feed for a manga (paginates through the API, max 500 per call). */
export async function getMangaFeed(mangaId, { languages } = {}, signal) {
  const all = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total && offset < 5000) {
    const res = await request(`/manga/${mangaId}/feed`, {
      signal,
      params: {
        limit: 500,
        offset,
        translatedLanguage: languages?.length ? languages : undefined,
        order: { volume: 'desc', chapter: 'desc' },
        includes: ['scanlation_group'],
        contentRating: ALL_RATINGS,
        includeEmptyPages: 0,
      },
    });
    all.push(...res.data.map(normalizeChapter));
    total = res.total;
    offset += res.limit;
  }
  return all;
}

export async function getChapter(id, signal) {
  const res = await request(`/chapter/${id}`, {
    signal,
    params: { includes: ['scanlation_group', 'manga'] },
  });
  return normalizeChapter(res.data);
}

/** Image URLs for a chapter from the MangaDex@Home network. */
export async function getChapterPages(id, { dataSaver = false } = {}, signal) {
  const res = await request(`/at-home/server/${id}`, { signal });
  const { baseUrl, chapter } = res;
  const quality = dataSaver ? 'data-saver' : 'data';
  const files = dataSaver ? chapter.dataSaver : chapter.data;
  return files.map((f) => `${baseUrl}/${quality}/${chapter.hash}/${f}`);
}

/** Latest chapters across the site (for the "new releases" feed). */
export async function getLatestChapters({ limit = 24, languages, contentRating } = {}, signal) {
  const res = await request('/chapter', {
    signal,
    params: {
      limit,
      translatedLanguage: languages,
      contentRating,
      order: { readableAt: 'desc' },
      includes: ['manga', 'scanlation_group'],
      includeFutureUpdates: 0,
      includeExternalUrl: 0,
    },
  });
  return res.data.map(normalizeChapter);
}
