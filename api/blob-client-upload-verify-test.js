import { timingSafeEqual } from 'node:crypto';
import { del, get } from '@vercel/blob';

const PATH_PREFIX = '__feasibility/client-upload/';
const AUTH_HEADER = 'x-blob-feasibility-test-key';
const MAX_BYTES = 5 * 1024 * 1024;
const NO_STORE = 'no-store';

const emptyResult = () => ({
  success: false,
  verified: false,
  cleanedUp: false,
  pathname: null,
  contentTypeOk: false,
  sizeOk: false,
  sanitizedError: 'UNKNOWN_ERROR',
});

const getHeader = (request, name) => {
  const headers = request?.headers;
  if (!headers) {
    return undefined;
  }

  if (typeof headers.get === 'function') {
    return headers.get(name) ?? undefined;
  }

  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

const authorize = (request) => {
  const expected = process.env.BLOB_FEASIBILITY_TEST_KEY;
  if (!expected) {
    return { ok: false, status: 503, sanitizedError: 'TEST_KEY_NOT_CONFIGURED' };
  }

  const provided = getHeader(request, AUTH_HEADER);
  if (typeof provided !== 'string' || provided.length === 0) {
    return { ok: false, status: 401, sanitizedError: 'UNAUTHORIZED' };
  }

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (
    expectedBuf.length !== providedBuf.length ||
    !timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return { ok: false, status: 401, sanitizedError: 'UNAUTHORIZED' };
  }

  return { ok: true };
};

const isAllowedPathname = (pathname) => {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return false;
  }
  if (!pathname.startsWith(PATH_PREFIX)) {
    return false;
  }
  if (pathname.includes('..') || pathname.includes('\\')) {
    return false;
  }
  return true;
};

const drainStream = async (stream) => {
  if (!stream) {
    return;
  }

  if (typeof stream.cancel === 'function') {
    try {
      await stream.cancel();
      return;
    } catch {
      // fall through to reader drain
    }
  }

  if (typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }
    }
  }
};

const sendJson = (response, status, body) => {
  response.setHeader('Cache-Control', NO_STORE);
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  return response.status(status).json(body);
};

export default async function handler(request, response) {
  const result = emptyResult();

  if (request.method !== 'POST') {
    result.sanitizedError = 'METHOD_NOT_ALLOWED';
    return sendJson(response, 405, result);
  }

  const auth = authorize(request);
  if (!auth.ok) {
    result.sanitizedError = auth.sanitizedError;
    return sendJson(response, auth.status, result);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    result.sanitizedError = 'BLOB_TOKEN_NOT_CONFIGURED';
    return sendJson(response, 503, result);
  }

  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      result.sanitizedError = 'INVALID_JSON_BODY';
      return sendJson(response, 400, result);
    }
  }

  const pathname = body?.pathname;
  if (!isAllowedPathname(pathname)) {
    result.sanitizedError = 'PATHNAME_NOT_ALLOWED';
    return sendJson(response, 403, result);
  }

  result.pathname = pathname;

  try {
    const blobResult = await get(pathname, { access: 'private' });

    if (!blobResult || blobResult.statusCode !== 200 || !blobResult.blob) {
      result.sanitizedError = 'BLOB_NOT_FOUND';
      return sendJson(response, 404, result);
    }

    const contentType = blobResult.blob.contentType || '';
    const size = Number(blobResult.blob.size);

    result.contentTypeOk =
      typeof contentType === 'string' && contentType.startsWith('image/');
    result.sizeOk = Number.isFinite(size) && size > 0 && size <= MAX_BYTES;
    result.verified = result.contentTypeOk && result.sizeOk;

    await drainStream(blobResult.stream);

    try {
      await del(pathname);
      result.cleanedUp = true;
    } catch {
      result.cleanedUp = false;
      result.sanitizedError = result.verified
        ? 'CLEANUP_FAILED'
        : 'VERIFY_OR_CLEANUP_FAILED';
      result.success = false;
      return sendJson(response, 500, result);
    }

    if (!result.verified) {
      result.sanitizedError = !result.contentTypeOk
        ? 'CONTENT_TYPE_NOT_IMAGE'
        : 'SIZE_OUT_OF_RANGE';
      result.success = false;
      return sendJson(response, 422, result);
    }

    result.success = true;
    result.sanitizedError = null;
    return sendJson(response, 200, result);
  } catch (error) {
    const name = error?.constructor?.name;
    if (name === 'BlobNotFoundError') {
      result.sanitizedError = 'BLOB_NOT_FOUND';
      return sendJson(response, 404, result);
    }

    result.sanitizedError = 'VERIFY_FAILED';
    return sendJson(response, 500, result);
  }
}
