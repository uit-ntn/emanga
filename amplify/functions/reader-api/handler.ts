import { handle } from './core.js';

type FunctionUrlEvent = {
  rawPath: string;
  queryStringParameters?: Record<string, string>;
  requestContext: { http: { method: string } };
};

/** Lambda Function URL handler (payload v2). CORS is configured on the Function URL itself. */
export const handler = async (event: FunctionUrlEvent) => {
  if (event.requestContext.http.method !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const path = event.rawPath.replace(/^\/api/, '') || '/';
  const res = await handle(path, event.queryStringParameters ?? {});
  const binary = Buffer.isBuffer(res.body);
  return {
    statusCode: res.status,
    headers: res.headers,
    body: binary ? (res.body as Buffer).toString('base64') : (res.body as string),
    isBase64Encoded: binary,
  };
};
