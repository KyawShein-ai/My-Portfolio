import { timingSafeEqual } from 'node:crypto';
import { handleUpload } from '@vercel/blob/client';

const PATH_PREFIX = '__feasibility/client-upload/';
const AUTH_HEADER = 'x-blob-feasibility-test-key';
const MAX_BYTES = 5 * 1024 * 1024;
const TOKEN_TTL_MS = 5 * 60 * 1000;
const NO_STORE = 'no-store';

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

const authorizeGenerateToken = (request) => {
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

const sendJson = (response, status, body) => {
  response.setHeader('Cache-Control', NO_STORE);
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  return response.status(status).json(body);
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, {
      success: false,
      sanitizedError: 'METHOD_NOT_ALLOWED',
    });
  }

  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(response, 400, {
        success: false,
        sanitizedError: 'INVALID_JSON_BODY',
      });
    }
  }

  if (!body || typeof body !== 'object' || typeof body.type !== 'string') {
    return sendJson(response, 400, {
      success: false,
      sanitizedError: 'INVALID_BODY',
    });
  }

  // Human/browser token minting requires the temporary test key.
  // Upload-completed callbacks from Vercel Blob are authenticated via signature inside handleUpload.
  if (body.type === 'blob.generate-client-token') {
    const auth = authorizeGenerateToken(request);
    if (!auth.ok) {
      return sendJson(response, auth.status, {
        success: false,
        sanitizedError: auth.sanitizedError,
      });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return sendJson(response, 503, {
        success: false,
        sanitizedError: 'BLOB_TOKEN_NOT_CONFIGURED',
      });
    }
  } else if (body.type !== 'blob.upload-completed') {
    return sendJson(response, 400, {
      success: false,
      sanitizedError: 'INVALID_EVENT_TYPE',
    });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAllowedPathname(pathname)) {
          throw new Error('PATHNAME_NOT_ALLOWED');
        }

        return {
          allowedContentTypes: ['image/*'],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + TOKEN_TTL_MS,
        };
      },
    });

    response.setHeader('Cache-Control', NO_STORE);
    return response.status(200).json(jsonResponse);
  } catch (error) {
    const message = error?.message === 'PATHNAME_NOT_ALLOWED'
      ? 'PATHNAME_NOT_ALLOWED'
      : 'UPLOAD_HANDLER_FAILED';

    const status = message === 'PATHNAME_NOT_ALLOWED' ? 403 : 400;
    return sendJson(response, status, {
      success: false,
      sanitizedError: message,
    });
  }
}
