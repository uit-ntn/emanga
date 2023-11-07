import { UPLOADS_BASE } from '../api/client';

/** Pick the best string from a MangaDex localized object, e.g. { en: '...', ja: '...' } */
export function pickLocalized(obj, preferred = ['vi', 'en']) {
  if (!obj) return '';
  for (const lang of preferred) if (obj[lang]) return obj[lang];
  const first = Object.values(obj)[0];
  return first || '';
}

/** Title: prefer vi/en title, then vi/en alt titles, then whatever exists. */
export function pickTitle(attributes, preferred = ['vi', 'en']) {
  const { title = {}, altTitles = [] } = attributes;
  for (const lang of preferred) {
    if (title[lang]) return title[lang];
    const alt = altTitles.find((t) => t[lang]);
    if (alt) return alt[lang];
  }
  return pickLocalized(title, ['ja-ro', 'en']) || 'Không có tiêu đề';
}

export function coverUrl(mangaId, fileName, size = 512) {
  if (!mangaId || !fileName) return null;
  const suffix = size ? `.${size}.jpg` : '';
  return `${UPLOADS_BASE}/covers/${mangaId}/${fileName}${suffix}`;
}

const rel = (item, type) => (item.relationships || []).filter((r) => r.type === type);

export function normalizeManga(item) {
  if (!item) return null;
  const a = item.attributes;
  const cover = rel(item, 'cover_art')[0];
  const fileName = cover?.attributes?.fileName;
  const names = (type) =>
    rel(item, type)
      .map((r) => r.attributes?.name)
      .filter(Boolean);

  return {
    id: item.id,
    title: pickTitle(a),
    altTitles: (a.altTitles || []).map((t) => Object.values(t)[0]).filter(Boolean),
    description: pickLocalized(a.description),
    status: a.status,
    year: a.year,
    demographic: a.publicationDemographic,
    contentRating: a.contentRating,
    originalLanguage: a.originalLanguage,
    lastChapter: a.lastChapter,
    lastVolume: a.lastVolume,
    availableLanguages: a.availableTranslatedLanguages || [],
    latestChapterId: a.latestUploadedChapter,
    updatedAt: a.updatedAt,
    createdAt: a.createdAt,
    tags: (a.tags || []).map((t) => ({
      id: t.id,
      name: pickLocalized(t.attributes.name, ['en']),
      group: t.attributes.group,
    })),
    authors: names('author'),
    artists: names('artist'),
    coverFile: fileName || null,
    cover: coverUrl(item.id, fileName, 512),
    coverSmall: coverUrl(item.id, fileName, 256),
    links: a.links || {},
  };
}

export function normalizeChapter(item) {
  const a = item.attributes;
  const groups = rel(item, 'scanlation_group').map((g) => ({ id: g.id, name: g.attributes?.name }));
  const manga = rel(item, 'manga')[0];
  return {
    id: item.id,
    chapter: a.chapter,
    volume: a.volume,
    title: a.title,
    language: a.translatedLanguage,
    pages: a.pages,
    externalUrl: a.externalUrl,
    publishAt: a.publishAt,
    readableAt: a.readableAt,
    groups: groups.filter((g) => g.name),
    mangaId: manga?.id,
    manga: manga?.attributes ? normalizeManga({ ...manga, relationships: [] }) : null,
  };
}

export function chapterLabel(ch) {
  if (!ch) return '';
  const num = ch.chapter ? `Chương ${ch.chapter}` : 'Oneshot';
  return ch.volume ? `Tập ${ch.volume} · ${num}` : num;
}
