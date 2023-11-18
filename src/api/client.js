export const API_URL = import.meta.env.VITE_ANILIST_API || 'https://graphql.anilist.co';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MESSAGES = {
  404: 'Không tìm thấy nội dung.',
  429: 'Bạn thao tác quá nhanh, vui lòng đợi vài giây rồi thử lại.',
};

/** Removes undefined / empty-array variables so AniList treats them as "no filter". */
export function cleanVariables(vars = {}) {
  return Object.fromEntries(
    Object.entries(vars).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length))
  );
}

/** POST a GraphQL query to AniList with retry on rate limit / server errors. */
export async function gql(query, variables, { signal, retries = 2 } = {}) {
  let attempt = 0;
  for (;;) {
    let res;
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables: cleanVariables(variables) }),
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (attempt < retries) {
        attempt += 1;
        await sleep(600 * 2 ** attempt);
        continue;
      }
      throw new ApiError('Không thể kết nối tới máy chủ. Kiểm tra mạng và thử lại.', 0);
    }

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      attempt += 1;
      const retryAfter = Number(res.headers.get('Retry-After')) || 0;
      await sleep(Math.max(retryAfter * 1000, 800 * 2 ** attempt));
      continue;
    }

    let body = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON error page */
    }

    if (!res.ok || body?.errors?.length) {
      const status = body?.errors?.[0]?.status || res.status;
      throw new ApiError(
        MESSAGES[status] || body?.errors?.[0]?.message || `Máy chủ gặp lỗi (${status}). Vui lòng thử lại sau.`,
        status
      );
    }
    return body.data;
  }
}
