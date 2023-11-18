import { gql } from './client';
import { normalizeManga, normalizeMangaDetail } from '../lib/normalize';

const CARD_FIELDS = `
  id
  title { romaji english native userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  format
  status
  chapters
  volumes
  averageScore
  popularity
  genres
  countryOfOrigin
  startDate { year }
  description(asHtml: false)
`;

const SEARCH_QUERY = `
query Search(
  $page: Int, $perPage: Int, $search: String, $sort: [MediaSort],
  $genres: [String], $excludedGenres: [String], $tags: [String], $excludedTags: [String],
  $status: [MediaStatus], $format: [MediaFormat], $country: CountryCode,
  $yearFrom: FuzzyDateInt, $yearTo: FuzzyDateInt, $ids: [Int]
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage perPage }
    media(
      type: MANGA, isAdult: false, search: $search, sort: $sort,
      genre_in: $genres, genre_not_in: $excludedGenres, tag_in: $tags, tag_not_in: $excludedTags,
      status_in: $status, format_in: $format, countryOfOrigin: $country,
      startDate_greater: $yearFrom, startDate_lesser: $yearTo, id_in: $ids
    ) { ${CARD_FIELDS} }
  }
}`;

/**
 * Search / list manga. All filters optional.
 * `year` filters are converted to AniList fuzzy dates (YYYYMMDD).
 */
export async function searchManga(
  { page = 1, perPage = 24, search, sort = ['POPULARITY_DESC'], genres, excludedGenres, tags, excludedTags, status, format, country, yearFrom, yearTo, ids } = {},
  signal
) {
  const data = await gql(
    SEARCH_QUERY,
    {
      page,
      perPage,
      search: search || undefined,
      sort: search && !sort?.length ? ['SEARCH_MATCH'] : sort,
      genres,
      excludedGenres,
      tags,
      excludedTags,
      status,
      format,
      country,
      yearFrom: yearFrom ? Number(`${yearFrom - 1}1231`) : undefined,
      yearTo: yearTo ? Number(`${Number(yearTo) + 1}0101`) : undefined,
      ids,
    },
    { signal }
  );
  const { pageInfo, media } = data.Page;
  return {
    items: media.map(normalizeManga),
    total: pageInfo.total,
    page: pageInfo.currentPage,
    lastPage: pageInfo.lastPage,
    hasNextPage: pageInfo.hasNextPage,
  };
}

const DETAIL_QUERY = `
query Detail($id: Int) {
  Media(id: $id, type: MANGA) {
    ${CARD_FIELDS}
    description(asHtml: false)
    synonyms
    meanScore
    favourites
    source
    isAdult
    endDate { year month day }
    startDate { year month day }
    siteUrl
    tags { id name description category rank isMediaSpoiler }
    externalLinks { id url site type language icon color }
    stats { scoreDistribution { score amount } statusDistribution { status amount } }
    rankings { rank type allTime year context }
    staff(perPage: 8, sort: [RELEVANCE]) {
      edges { role node { id name { full } image { medium } } }
    }
    characters(perPage: 12, sort: [ROLE, RELEVANCE]) {
      edges { role node { id name { full } image { medium } } }
    }
    relations {
      edges { relationType(version: 2) node { ${CARD_FIELDS} type } }
    }
    recommendations(perPage: 12, sort: [RATING_DESC]) {
      nodes { mediaRecommendation { ${CARD_FIELDS} type isAdult } }
    }
  }
}`;

export async function getManga(id, signal) {
  const data = await gql(DETAIL_QUERY, { id: Number(id) }, { signal });
  return normalizeMangaDetail(data.Media);
}

const META_QUERY = `
query Meta {
  GenreCollection
  MediaTagCollection { name description category isAdult }
}`;

export async function getGenresAndTags(signal) {
  const data = await gql(META_QUERY, {}, { signal });
  return {
    genres: data.GenreCollection.filter((g) => g !== 'Hentai'),
    tags: data.MediaTagCollection.filter((t) => !t.isAdult).map((t) => ({
      name: t.name,
      description: t.description,
      category: t.category,
    })),
  };
}
