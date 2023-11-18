import { describe, expect, it } from 'vitest';
import { cleanVariables } from '../../api/client';
import { cleanDescription, normalizeManga, pickTitle, plainText } from '../normalize';
import { timeAgo } from '../format';

describe('cleanVariables', () => {
  it('drops empty values so AniList ignores the filter', () => {
    expect(cleanVariables({ a: 1, b: undefined, c: '', d: [], e: ['x'], f: null, g: 0 })).toEqual({ a: 1, e: ['x'], g: 0 });
  });
});

describe('pickTitle', () => {
  it('prefers english then romaji then native', () => {
    expect(pickTitle({ english: 'Attack on Titan', romaji: 'Shingeki no Kyojin' })).toBe('Attack on Titan');
    expect(pickTitle({ romaji: 'Shingeki no Kyojin', native: '進撃の巨人' })).toBe('Shingeki no Kyojin');
    expect(pickTitle({})).toBe('Không có tiêu đề');
  });
});

describe('cleanDescription', () => {
  it('converts AniList html/markdown and removes spoilers', () => {
    const out = cleanDescription('Hello<br><br><i>world</i> __bold__ ~!secret!~ &quot;q&quot;');
    expect(out).toBe('Hello\n\n_world_ **bold**  "q"');
  });
  it('plainText strips formatting', () => {
    expect(plainText('<b>Hi</b> [link](https://x.y)')).toBe('Hi link');
  });
});

describe('normalizeManga', () => {
  it('maps AniList media to card model', () => {
    const m = normalizeManga({
      id: 1,
      title: { romaji: 'Berserk' },
      coverImage: { extraLarge: 'xl.jpg', large: 'l.jpg', color: '#fff' },
      averageScore: 93,
      genres: ['Action'],
      countryOfOrigin: 'JP',
      startDate: { year: 1989 },
      status: 'RELEASING',
    });
    expect(m).toMatchObject({ id: 1, title: 'Berserk', cover: 'xl.jpg', coverSmall: 'l.jpg', score: 93, year: 1989 });
  });
});

describe('timeAgo', () => {
  it('formats relative time in vietnamese', () => {
    const now = Date.UTC(2023, 10, 10);
    expect(timeAgo(new Date(now - 3 * 3600 * 1000), now)).toMatch(/3 giờ/);
  });
});
