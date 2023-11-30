import { createPersistedStore } from './createStore';

/**
 * Personal library stored locally in the browser – no account required.
 * entries: id -> { id, title, cover, color, format, country, chapters, mangaStatus,
 *                  status, progress, score, addedAt, updatedAt }
 */
export const LIST_STATUS = {
  READING: { label: 'Đang đọc', color: 'bg-emerald-500' },
  PLANNING: { label: 'Dự định đọc', color: 'bg-sky-500' },
  COMPLETED: { label: 'Đã đọc xong', color: 'bg-violet-500' },
  PAUSED: { label: 'Tạm dừng', color: 'bg-amber-500' },
  DROPPED: { label: 'Bỏ dở', color: 'bg-zinc-500' },
};

export const libraryStore = createPersistedStore('emanga:library', { entries: {} });
export const useLibrary = libraryStore.useStore;

// Migrate the old "follows" format (v1) to entries
(() => {
  const s = libraryStore.getState();
  if (s.follows && Object.keys(s.follows).length) {
    const entries = { ...s.entries };
    Object.values(s.follows).forEach((f) => {
      entries[f.id] ??= { id: f.id, title: f.title, cover: f.cover, status: 'PLANNING', progress: 0, score: 0, addedAt: f.addedAt, updatedAt: f.addedAt };
    });
    libraryStore.setState({ entries, follows: undefined, history: undefined, read: undefined });
  }
})();

const snapshot = (m) => ({
  id: m.id,
  title: m.title,
  cover: m.coverSmall,
  color: m.color,
  format: m.format,
  country: m.country,
  chapters: m.chapters,
  mangaStatus: m.status,
  score: m.score,
});

/** Add or update an entry. `patch` may contain status, progress, userScore. */
export function saveEntry(manga, patch) {
  libraryStore.setState((s) => {
    const prev = s.entries[manga.id];
    const now = Date.now();
    const next = {
      status: 'PLANNING',
      progress: 0,
      userScore: 0,
      addedAt: now,
      ...prev,
      ...snapshot(manga),
      ...patch,
      updatedAt: now,
    };
    if (next.chapters && next.progress > next.chapters) next.progress = next.chapters;
    if (next.progress < 0) next.progress = 0;
    // reaching the last chapter of a finished series marks it completed
    if (patch.progress !== undefined && next.chapters && next.progress === next.chapters && next.mangaStatus === 'FINISHED') {
      next.status = 'COMPLETED';
    }
    if (patch.progress > 0 && next.status === 'PLANNING') next.status = 'READING';
    return { ...s, entries: { ...s.entries, [manga.id]: next } };
  });
}

/**
 * Called by the reader: remembers the last chapter/page and bumps progress to the
 * chapter number. Opening a chapter adds the manga to the library as "Đang đọc".
 */
export function recordRead(manga, chapter, page = 0) {
  if (!manga?.id || !chapter?.id) return;
  const entry = libraryStore.getState().entries[manga.id];
  const last = entry?.lastRead;
  if (last && last.chapterId === chapter.id && last.page === page) return;
  const num = Math.floor(parseFloat(chapter.chapter));
  const patch = {
    lastRead: { chapterId: chapter.id, chapter: chapter.chapter, language: chapter.language, page, at: Date.now() },
  };
  if (!Number.isNaN(num) && num > (entry?.progress ?? 0)) patch.progress = num;
  if (!entry || entry.status === 'PLANNING') patch.status = 'READING';
  saveEntry(manga, patch);
}

export function removeEntry(id) {
  libraryStore.setState((s) => {
    const entries = { ...s.entries };
    delete entries[id];
    return { ...s, entries };
  });
}

export function exportLibrary() {
  return JSON.stringify({ app: 'emanga', version: 2, exportedAt: new Date().toISOString(), entries: libraryStore.getState().entries }, null, 2);
}

/** Merge an exported file into the current library; newer entries win. Returns number imported. */
export function importLibrary(json) {
  let data;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('File không phải JSON hợp lệ.');
  }
  if (!data || data.app !== 'emanga' || typeof data.entries !== 'object') throw new Error('Đây không phải file sao lưu của eManga.');
  const incoming = Object.values(data.entries).filter((e) => e && e.id && e.title && LIST_STATUS[e.status]);
  libraryStore.setState((s) => {
    const entries = { ...s.entries };
    incoming.forEach((e) => {
      if (!entries[e.id] || (e.updatedAt ?? 0) > (entries[e.id].updatedAt ?? 0)) entries[e.id] = e;
    });
    return { ...s, entries };
  });
  return incoming.length;
}
