import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as api from '../api/anilist';

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
