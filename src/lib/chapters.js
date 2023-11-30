export const chapterNum = (c) => (c?.chapter === null || c?.chapter === undefined ? -1 : parseFloat(c.chapter));
export const chapterTitle = (c) => (c?.chapter ? `Chương ${c.chapter}` : 'Oneshot');
export const chapterLabel = (c) => (c?.volume ? `Tập ${c.volume} · ${chapterTitle(c)}` : chapterTitle(c));

/**
 * Ordered list of readable chapters (one per chapter number) for prev/next navigation.
 * When several groups translated the same chapter, prefer the group of the current one.
 */
export function buildNavigation(chapters, current) {
  if (!current || !chapters) return { list: [], prev: null, next: null };
  const groups = new Set(current.groups);
  const byNumber = new Map();
  for (const c of chapters) {
    if (c.externalUrl) continue;
    const key = c.chapter ?? `oneshot-${c.id}`;
    const existing = byNumber.get(key);
    const sameGroup = c.groups.some((g) => groups.has(g));
    if (existing?.id === current.id) continue;
    if (c.id === current.id || !existing || (sameGroup && !existing.sameGroup)) byNumber.set(key, { ...c, sameGroup });
  }
  byNumber.set(current.chapter ?? `oneshot-${current.id}`, { ...current, sameGroup: true });
  const list = [...byNumber.values()].sort((a, b) => chapterNum(a) - chapterNum(b));
  const i = list.findIndex((c) => c.id === current.id);
  return { list, prev: i > 0 ? list[i - 1] : null, next: i < list.length - 1 ? list[i + 1] : null };
}

/** First readable chapter (lowest number). */
export function firstReadable(chapters) {
  return (chapters ?? [])
    .filter((c) => !c.externalUrl)
    .reduce((min, c) => (!min || chapterNum(c) < chapterNum(min) ? c : min), null);
}
