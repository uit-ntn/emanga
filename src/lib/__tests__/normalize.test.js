import { describe, expect, it } from 'vitest';
import { buildQuery } from '../../api/client';
import { chapterLabel, normalizeManga, pickTitle } from '../normalize';
import { timeAgo } from '../format';

describe('buildQuery', () => {
  it('serialises arrays, order objects and skips empty values', () => {
    const qs = buildQuery({
      title: 'one piece',
      includes: ['cover_art', 'author'],
      order: { followedCount: 'desc' },
      year: undefined,
      status: '',
    });
    const sp = new URLSearchParams(qs.slice(1));
    expect(sp.get('title')).toBe('one piece');
    expect(sp.getAll('includes[]')).toEqual(['cover_art', 'author']);
    expect(sp.get('order[followedCount]')).toBe('desc');
    expect(sp.has('year')).toBe(false);
    expect(sp.has('status')).toBe(false);
  });

  it('returns empty string without params', () => {
    expect(buildQuery()).toBe('');
  });
});

describe('pickTitle', () => {
  it('prefers vietnamese alt title over japanese main title', () => {
    expect(pickTitle({ title: { 'ja-ro': 'Shingeki' }, altTitles: [{ vi: 'Đại chiến Titan' }] })).toBe(
      'Đại chiến Titan'
    );
  });
  it('falls back to romaji', () => {
    expect(pickTitle({ title: { 'ja-ro': 'Shingeki' }, altTitles: [] })).toBe('Shingeki');
  });
});

describe('normalizeManga', () => {
  it('extracts cover, authors and tags', () => {
    const m = normalizeManga({
      id: 'abc',
      attributes: {
        title: { en: 'Test' },
        description: { en: 'Desc' },
        status: 'ongoing',
        tags: [{ id: 't1', attributes: { name: { en: 'Action' }, group: 'genre' } }],
      },
      relationships: [
        { type: 'cover_art', attributes: { fileName: 'c.jpg' } },
        { type: 'author', attributes: { name: 'Oda' } },
      ],
    });
    expect(m.title).toBe('Test');
    expect(m.cover).toMatch(/\/covers\/abc\/c\.jpg\.512\.jpg$/);
    expect(m.authors).toEqual(['Oda']);
    expect(m.tags[0]).toEqual({ id: 't1', name: 'Action', group: 'genre' });
  });
});

describe('chapterLabel', () => {
  it('formats volume and chapter', () => {
    expect(chapterLabel({ volume: '2', chapter: '10' })).toBe('Tập 2 · Chương 10');
    expect(chapterLabel({ chapter: null })).toBe('Oneshot');
  });
});

describe('timeAgo', () => {
  it('formats relative time in vietnamese', () => {
    const now = Date.UTC(2023, 10, 10);
    expect(timeAgo(new Date(now - 3 * 3600 * 1000), now)).toMatch(/3 giờ/);
  });
});
