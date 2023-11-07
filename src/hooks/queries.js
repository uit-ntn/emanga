import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as api from '../api/mangadex';

export const queryKeys = {
  search: (params) => ['manga', 'search', params],
  manga: (id) => ['manga', id],
  stats: (ids) => ['stats', [...ids].sort()],
  tags: ['tags'],
  feed: (id, languages) => ['feed', id, languages],
  chapter: (id) => ['chapter', id],
  pages: (id, dataSaver) => ['pages', id, dataSaver],
  latest: (params) => ['latest', params],
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

export function useStatistics(ids = []) {
  return useQuery({
    queryKey: queryKeys.stats(ids),
    queryFn: ({ signal }) => api.getStatistics(ids, signal),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: ({ signal }) => api.getTags(signal),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useMangaFeed(id, languages) {
  return useQuery({
    queryKey: queryKeys.feed(id, languages),
    queryFn: ({ signal }) => api.getMangaFeed(id, { languages }, signal),
    enabled: Boolean(id),
  });
}

export function useChapter(id) {
  return useQuery({
    queryKey: queryKeys.chapter(id),
    queryFn: ({ signal }) => api.getChapter(id, signal),
    enabled: Boolean(id),
  });
}

export function useChapterPages(id, dataSaver) {
  return useQuery({
    queryKey: queryKeys.pages(id, dataSaver),
    queryFn: ({ signal }) => api.getChapterPages(id, { dataSaver }, signal),
    enabled: Boolean(id),
    // at-home URLs expire after ~15 minutes
    staleTime: 10 * 60 * 1000,
    gcTime: 12 * 60 * 1000,
  });
}

export function useLatestChapters(params) {
  return useQuery({
    queryKey: queryKeys.latest(params),
    queryFn: ({ signal }) => api.getLatestChapters(params, signal),
  });
}
