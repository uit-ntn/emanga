import { createPersistedStore } from './createStore';

const MAX_HISTORY = 200;
const MAX_READ = 10000;

/**
 * Everything is stored locally in the browser – no account required.
 *  follows:  mangaId -> { id, title, cover, status, addedAt }
 *  history:  mangaId -> { mangaId, title, cover, chapterId, chapter, volume, language, page, updatedAt }
 *  read:     chapterId -> timestamp
 */
export const libraryStore = createPersistedStore('emanga:library', {
  follows: {},
  history: {},
  read: {},
});

export const useLibrary = libraryStore.useStore;

const pickManga = (m) => ({ id: m.id, title: m.title, cover: m.coverSmall, status: m.status });

export function toggleFollow(manga) {
  libraryStore.setState((s) => {
    const follows = { ...s.follows };
    if (follows[manga.id]) delete follows[manga.id];
    else follows[manga.id] = { ...pickManga(manga), addedAt: Date.now() };
    return { ...s, follows };
  });
}

export function removeFollow(id) {
  libraryStore.setState((s) => {
    const follows = { ...s.follows };
    delete follows[id];
    return { ...s, follows };
  });
}

export function recordProgress(manga, chapter, page = 0) {
  if (!manga?.id || !chapter?.id) return;
  libraryStore.setState((s) => {
    const prev = s.history[manga.id];
    if (prev && prev.chapterId === chapter.id && prev.page === page) return s;

    let history = {
      ...s.history,
      [manga.id]: {
        mangaId: manga.id,
        title: manga.title,
        cover: manga.coverSmall,
        chapterId: chapter.id,
        chapter: chapter.chapter,
        volume: chapter.volume,
        language: chapter.language,
        page,
        updatedAt: Date.now(),
      },
    };
    const entries = Object.values(history);
    if (entries.length > MAX_HISTORY) {
      entries.sort((a, b) => b.updatedAt - a.updatedAt);
      history = Object.fromEntries(entries.slice(0, MAX_HISTORY).map((e) => [e.mangaId, e]));
    }

    let read = s.read[chapter.id] ? s.read : { ...s.read, [chapter.id]: Date.now() };
    const readKeys = Object.keys(read);
    if (readKeys.length > MAX_READ) {
      read = Object.fromEntries(
        Object.entries(read)
          .sort((a, b) => b[1] - a[1])
          .slice(0, MAX_READ)
      );
    }
    return { ...s, history, read };
  });
}

export function removeHistory(mangaId) {
  libraryStore.setState((s) => {
    const history = { ...s.history };
    delete history[mangaId];
    return { ...s, history };
  });
}

export function clearHistory() {
  libraryStore.setState((s) => ({ ...s, history: {}, read: {} }));
}

export function setChapterRead(chapterId, isRead) {
  libraryStore.setState((s) => {
    const read = { ...s.read };
    if (isRead) read[chapterId] = Date.now();
    else delete read[chapterId];
    return { ...s, read };
  });
}

/** Export / import for moving data between devices. */
export function exportLibrary() {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...libraryStore.getState() }, null, 2);
}

export function importLibrary(json) {
  const data = JSON.parse(json);
  if (!data || typeof data !== 'object' || !data.follows) throw new Error('File không hợp lệ');
  libraryStore.setState((s) => ({
    follows: { ...s.follows, ...data.follows },
    history: { ...s.history, ...(data.history || {}) },
    read: { ...s.read, ...(data.read || {}) },
  }));
}
