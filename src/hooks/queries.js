import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as api from '../api/anilist';
import * as reader from '../api/reader';

export const queryKeys = {
  search: (params) => ['manga', 'search', params],
  manga: (id) => ['manga', 'detail', String(id)],
  meta: ['meta'],
};

export function useMangaSearch(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: ({ signal }) => api.searchManga(params, signal),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useManga(id) {
  return useQuery({
    queryKey: queryKeys.manga(id),
    queryFn: ({ signal }) => api.getManga(id, signal),
    enabled: Boolean(id),
  });
}

export function useGenresAndTags() {
  return useQuery({
    queryKey: queryKeys.meta,
    queryFn: ({ signal }) => api.getGenresAndTags(signal),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/* ----------------------------------------------------------- reader */

export function useReaderSource(manga) {
  return useQuery({
    queryKey: ['reader', 'lookup', manga?.id],
    queryFn: ({ signal }) => reader.lookupSource(manga, signal),
    enabled: Boolean(manga?.id),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

export function useReaderFeed(sourceId, lang) {
  return useQuery({
    queryKey: ['reader', 'feed', sourceId, lang],
    queryFn: ({ signal }) => reader.getFeed(sourceId, lang, signal),
    enabled: Boolean(sourceId && lang),
  });
}

export function useReaderChapter(chapterId, dataSaver) {
  return useQuery({
    queryKey: ['reader', 'chapter', chapterId, dataSaver],
    queryFn: ({ signal }) => reader.getChapter(chapterId, { dataSaver }, signal),
    enabled: Boolean(chapterId),
    // image URLs from MangaDex@Home expire after ~15 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
