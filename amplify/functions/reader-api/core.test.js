import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { USER_AGENT, clearCache, handle, isAllowedImageUrl } from './core.js';

const ok = (data) => ({ ok: true, status: 200, json: async () => data, headers: new Headers() });

describe('isAllowedImageUrl', () => {
  it('only allows MangaDex image hosts over https', () => {
    expect(isAllowedImageUrl('https://abc123.mangadex.network/data/x/1.jpg')).toBe(true);
    expect(isAllowedImageUrl('https://uploads.mangadex.org/covers/a/b.jpg')).toBe(true);
    expect(isAllowedImageUrl('http://abc.mangadex.network/x.jpg')).toBe(false);
    expect(isAllowedImageUrl('https://evil.com/?mangadex.network')).toBe(false);
    expect(isAllowedImageUrl('https://mangadex.network.evil.com/x.jpg')).toBe(false);
    expect(isAllowedImageUrl('https://169.254.169.254/latest')).toBe(false);
    expect(isAllowedImageUrl('not a url')).toBe(false);
  });
});

describe('handle', () => {
  beforeEach(() => {
    clearCache();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('rejects invalid input without calling upstream', async () => {
    expect((await handle('/feed/not-a-uuid')).status).toBe(400);
    expect((await handle('/lookup', { anilistId: 'abc', title: 'x' })).status).toBe(400);
    expect((await handle('/image', { u: 'https://example.com/a.jpg' })).status).toBe(400);
    expect((await handle('/nope')).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('lookup matches the MangaDex entry by AniList id and sends an honest User-Agent', async () => {
    fetch.mockResolvedValueOnce(
      ok({
        data: [
          { id: 'wrong', attributes: { links: { al: '1' } } },
          { id: 'right', attributes: { links: { al: '30013' }, availableTranslatedLanguages: ['vi', 'en', 'fr'] } },
        ],
      })
    );
    // languages come from real chapters (fr was removed), sorted by chapter count
    fetch.mockResolvedValueOnce(
      ok({
        data: [
          { attributes: { translatedLanguage: 'en' } },
          { attributes: { translatedLanguage: 'vi' } },
          { attributes: { translatedLanguage: 'en' } },
        ],
      })
    );
    const res = await handle('/lookup', { anilistId: '30013', title: 'One Piece' });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ id: 'right', languages: ['en', 'vi'] });
    expect(fetch.mock.calls[1][0]).toContain('/manga/right/feed');
    expect(fetch.mock.calls[0][1].headers['User-Agent']).toBe(USER_AGENT);
  });

  it('chapter returns proxied image paths', async () => {
    const id = '11111111-2222-3333-4444-555555555555';
    fetch
      .mockResolvedValueOnce(
        ok({
          data: {
            id,
            attributes: { chapter: '1', translatedLanguage: 'vi', pages: 2 },
            relationships: [
              { type: 'scanlation_group', attributes: { name: 'Team A' } },
              { type: 'manga', id: 'm1' },
            ],
          },
        })
      )
      .mockResolvedValueOnce(
        ok({ baseUrl: 'https://node1.mangadex.network', chapter: { hash: 'h', data: ['a.png'], dataSaver: ['a.jpg', 'b.jpg'] } })
      );
    const body = JSON.parse((await handle(`/chapter/${id}`)).body);
    expect(body.groups).toEqual(['Team A']);
    expect(body.mangadexId).toBe('m1');
    expect(body.images).toHaveLength(2);
    expect(decodeURIComponent(body.images[0])).toBe('/image?u=https://node1.mangadex.network/data-saver/h/a.jpg');
  });

  it('maps upstream rate limiting to 503', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 429, headers: new Headers() });
    const res = await handle('/feed/11111111-2222-3333-4444-555555555555', { lang: 'vi' });
    expect(res.status).toBe(503);
  });
});
