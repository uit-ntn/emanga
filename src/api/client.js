export const API_BASE = (import.meta.env.VITE_MANGADEX_API || 'https://api.mangadex.org').replace(/\/$/, '');
export const UPLOADS_BASE = (import.meta.env.VITE_MANGADEX_UPLOADS || 'https://uploads.mangadex.org').replace(
  /\/$/,
  ''
);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Serialises params the way MangaDex expects:
 *  - arrays  -> key[]=a&key[]=b
 *  - objects -> key[field]=value   (used for `order`)
 *  - null/undefined/'' are skipped
 */
export function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(`${key}[]`, v));
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => {
        if (v !== undefined && v !== null) sp.append(`${key}[${k}]`, v);
      });
    } else {
      sp.append(key, String(value));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function request(path, { params, signal, retries = 2 } = {}) {
  const url = `${API_BASE}${path}${buildQuery(params)}`;
  let attempt = 0;

  for (;;) {
    let res;
    try {
      res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (attempt < retries) {
        attempt += 1;
        await sleep(500 * 2 ** attempt);
        continue;
      }
      throw new ApiError('Không thể kết nối tới máy chủ. Kiểm tra mạng và thử lại.', 0);
    }

    if (res.ok) return res.json();

    // Retry on rate-limit / transient server errors
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      attempt += 1;
      const retryAfter = Number(res.headers.get('Retry-After')) || 0;
      await sleep(Math.max(retryAfter * 1000, 500 * 2 ** attempt));
      continue;
    }

    let detail = '';
    try {
      const body = await res.json();
      detail = body?.errors?.[0]?.detail || '';
    } catch {
      /* ignore */
    }
    const messages = {
      400: 'Yêu cầu không hợp lệ.',
      404: 'Không tìm thấy nội dung.',
      429: 'Bạn thao tác quá nhanh, vui lòng thử lại sau giây lát.',
    };
    throw new ApiError(
      messages[res.status] || detail || `Máy chủ gặp lỗi (${res.status}). Vui lòng thử lại sau.`,
      res.status
    );
  }
}
