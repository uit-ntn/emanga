/** Prefer the English title, then romaji, then native. */
export function pickTitle(title = {}) {
  return title.english || title.romaji || title.userPreferred || title.native || 'Không có tiêu đề';
}

/**
 * AniList descriptions (asHtml: false) still contain some HTML tags (<br>, <i>, <b>)
 * and AniList markdown (~!spoiler!~, __bold__). Convert to plain markdown-ish text.
 */
export function cleanDescription(text = '') {
  if (!text) return '';
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(i|em)>/gi, '_')
    .replace(/<\/?(b|strong)>/gi, '**')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/~!([\s\S]*?)!~/g, '')
    .replace(/__([^_]+)__/g, '**$1**')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function plainText(text = '') {
  return cleanDescription(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]/g, '');
}

export function normalizeManga(m) {
  if (!m) return null;
  return {
    id: m.id,
    title: pickTitle(m.title),
    romaji: m.title?.romaji,
    native: m.title?.native,
    cover: m.coverImage?.extraLarge || m.coverImage?.large,
    coverSmall: m.coverImage?.large || m.coverImage?.medium,
    color: m.coverImage?.color,
    banner: m.bannerImage,
    format: m.format,
    status: m.status,
    chapters: m.chapters,
    volumes: m.volumes,
    score: m.averageScore,
    popularity: m.popularity,
    genres: m.genres ?? [],
    country: m.countryOfOrigin,
    year: m.startDate?.year,
    description: cleanDescription(m.description),
  };
}

const formatDate = (d) => (d?.year ? [d.day, d.month, d.year].filter(Boolean).join('/') : null);

export function normalizeMangaDetail(m) {
  const base = normalizeManga(m);
  return {
    ...base,
    synonyms: m.synonyms ?? [],
    meanScore: m.meanScore,
    favourites: m.favourites,
    source: m.source,
    startDate: formatDate(m.startDate),
    endDate: formatDate(m.endDate),
    siteUrl: m.siteUrl,
    tags: (m.tags ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      rank: t.rank,
      spoiler: t.isMediaSpoiler,
      category: t.category,
    })),
    links: m.externalLinks ?? [],
    rankings: (m.rankings ?? []).filter((r) => r.allTime),
    scoreDistribution: m.stats?.scoreDistribution ?? [],
    statusDistribution: m.stats?.statusDistribution ?? [],
    staff: (m.staff?.edges ?? []).map((e) => ({
      id: e.node.id,
      name: e.node.name.full,
      image: e.node.image?.medium,
      role: e.role,
    })),
    characters: (m.characters?.edges ?? []).map((e) => ({
      id: e.node.id,
      name: e.node.name.full,
      image: e.node.image?.medium,
      role: e.role,
    })),
    relations: (m.relations?.edges ?? [])
      .filter((e) => e.node.type === 'MANGA')
      .map((e) => ({ type: e.relationType, manga: normalizeManga(e.node) })),
    recommendations: (m.recommendations?.nodes ?? [])
      .map((n) => n.mediaRecommendation)
      .filter((r) => r && r.type === 'MANGA' && !r.isAdult)
      .map(normalizeManga),
  };
}
