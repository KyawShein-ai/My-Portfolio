import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { del, get, put } from '@vercel/blob';

const EXPECTED_SUPABASE_URL = 'https://lxtlbdwetbdkapskkpou.supabase.co';
const SUPABASE_BUCKET = 'Portfolio';
const PAYLOAD_TEXT = 'blob-feasibility-ok';
const PAYLOAD_BYTES = Buffer.from(PAYLOAD_TEXT, 'utf8');
const STEP_TIMEOUT_MS = 15000;

const emptyResult = () => ({
  success: false,
  testId: null,
  blobUpload: false,
  blobRead: false,
  blobContentVerified: false,
  supabaseUpload: false,
  supabaseRead: false,
  supabaseContentVerified: false,
  blobCleanup: false,
  supabaseCleanup: false,
  permissionLimited: false,
  sanitizedError: 'UNKNOWN_ERROR',
});

const withTimeout = (fn, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const timeoutPromise = new Promise((_, reject) => {
    const fail = () => {
      reject(Object.assign(new Error('TIMEOUT'), { name: 'AbortError' }));
    };

    if (controller.signal.aborted) {
      fail();
      return;
    }

    controller.signal.addEventListener('abort', fail, { once: true });
  });

  return Promise.race([fn(controller.signal), timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
};

const streamToBuffer = async (stream) => {
  if (!stream) {
    throw new Error('EMPTY_STREAM');
  }

  if (typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(Buffer.from(value));
    }

    return Buffer.concat(chunks);
  }

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const isPermissionStatus = (status) => status === 401 || status === 403;

const extractStatus = (error) => {
  const status = error?.status ?? error?.statusCode ?? error?.cause?.status;
  const numeric = Number(status);
  return Number.isInteger(numeric) ? numeric : null;
};

const isMissingObjectError = (error) => {
  const name = error?.constructor?.name;
  if (name === 'BlobNotFoundError') {
    return true;
  }

  const status = extractStatus(error);
  return status === 404;
};

export default async function handler(request, response) {
  const startedAt = Date.now();
  const result = emptyResult();

  const finish = () => {
    const success =
      result.blobUpload &&
      result.blobRead &&
      result.blobContentVerified &&
      result.supabaseUpload &&
      result.supabaseRead &&
      result.supabaseContentVerified &&
      result.blobCleanup &&
      result.supabaseCleanup &&
      result.sanitizedError === null;

    result.success = success;

    return response.status(success ? 200 : result.httpStatus || 500).json({
      success: result.success,
      testId: result.testId,
      blobUpload: result.blobUpload,
      blobRead: result.blobRead,
      blobContentVerified: result.blobContentVerified,
      supabaseUpload: result.supabaseUpload,
      supabaseRead: result.supabaseRead,
      supabaseContentVerified: result.supabaseContentVerified,
      blobCleanup: result.blobCleanup,
      supabaseCleanup: result.supabaseCleanup,
      permissionLimited: result.permissionLimited,
      durationMs: Date.now() - startedAt,
      sanitizedError: result.sanitizedError,
    });
  };

  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    result.httpStatus = 405;
    result.sanitizedError = 'METHOD_NOT_ALLOWED';
    result.blobCleanup = true;
    result.supabaseCleanup = true;
    return finish();
  }

  const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!blobReadWriteToken || !supabaseUrl || !supabaseAnonKey) {
    result.sanitizedError = 'ENVIRONMENT_MISSING';
    result.blobCleanup = true;
    result.supabaseCleanup = true;
    return finish();
  }

  if (supabaseUrl !== EXPECTED_SUPABASE_URL) {
    result.sanitizedError = 'INVALID_SUPABASE_URL';
    result.blobCleanup = true;
    result.supabaseCleanup = true;
    return finish();
  }

  const testId = randomUUID();
  result.testId = testId;

  const blobPathname = `__feasibility/vercel-blob/${testId}/probe.txt`;
  const supabaseObjectPath = `__feasibility/vercel-blob/${testId}/probe.txt`;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    try {
      await withTimeout(
        (abortSignal) =>
          put(blobPathname, PAYLOAD_BYTES, {
            access: 'private',
            contentType: 'text/plain',
            addRandomSuffix: false,
            abortSignal,
          }),
        STEP_TIMEOUT_MS,
      );
      result.blobUpload = true;
    } catch {
      result.sanitizedError = 'BLOB_UPLOAD_FAILED';
      throw new Error('BLOB_UPLOAD_FAILED');
    }

    try {
      const blobResult = await withTimeout(
        (abortSignal) =>
          get(blobPathname, {
            access: 'private',
            useCache: false,
            abortSignal,
          }),
        STEP_TIMEOUT_MS,
      );

      if (!blobResult || blobResult.statusCode !== 200 || !blobResult.stream) {
        result.sanitizedError = 'BLOB_READ_FAILED';
        throw new Error('BLOB_READ_FAILED');
      }

      result.blobRead = true;
      const blobBytes = await streamToBuffer(blobResult.stream);

      if (!blobBytes.equals(PAYLOAD_BYTES)) {
        result.sanitizedError = 'BLOB_CONTENT_MISMATCH';
        throw new Error('BLOB_CONTENT_MISMATCH');
      }

      result.blobContentVerified = true;
    } catch (error) {
      if (result.sanitizedError === 'UNKNOWN_ERROR') {
        result.sanitizedError = 'BLOB_READ_FAILED';
      }
      throw error;
    }

    try {
      const { error: uploadError } = await withTimeout(
        () =>
          supabase.storage.from(SUPABASE_BUCKET).upload(supabaseObjectPath, PAYLOAD_BYTES, {
            contentType: 'text/plain',
            upsert: false,
          }),
        STEP_TIMEOUT_MS,
      );

      if (uploadError) {
        if (isPermissionStatus(extractStatus(uploadError))) {
          result.permissionLimited = true;
        }
        result.sanitizedError = 'SUPABASE_UPLOAD_FAILED';
        throw uploadError;
      }

      result.supabaseUpload = true;
    } catch (error) {
      if (isPermissionStatus(extractStatus(error))) {
        result.permissionLimited = true;
      }
      result.sanitizedError = 'SUPABASE_UPLOAD_FAILED';
      throw error;
    }

    try {
      const { data: downloaded, error: downloadError } = await withTimeout(
        () => supabase.storage.from(SUPABASE_BUCKET).download(supabaseObjectPath),
        STEP_TIMEOUT_MS,
      );

      if (downloadError || !downloaded) {
        if (isPermissionStatus(extractStatus(downloadError))) {
          result.permissionLimited = true;
        }
        result.sanitizedError = 'SUPABASE_READ_FAILED';
        throw downloadError || new Error('SUPABASE_READ_FAILED');
      }

      result.supabaseRead = true;
      const downloadedBytes = Buffer.from(await downloaded.arrayBuffer());

      if (!downloadedBytes.equals(PAYLOAD_BYTES)) {
        result.sanitizedError = 'SUPABASE_CONTENT_MISMATCH';
        throw new Error('SUPABASE_CONTENT_MISMATCH');
      }

      result.supabaseContentVerified = true;
      result.sanitizedError = null;
    } catch (error) {
      if (result.sanitizedError === 'UNKNOWN_ERROR' || result.sanitizedError === null) {
        result.sanitizedError = 'SUPABASE_READ_FAILED';
      }
      throw error;
    }
  } catch {
    if (!result.sanitizedError) {
      result.sanitizedError = 'UNKNOWN_ERROR';
    }
  } finally {
    try {
      await withTimeout(
        (abortSignal) => del(blobPathname, { abortSignal }),
        STEP_TIMEOUT_MS,
      );
      result.blobCleanup = true;
    } catch (error) {
      result.blobCleanup = isMissingObjectError(error);
      if (!result.blobCleanup && (result.sanitizedError === null || result.supabaseContentVerified)) {
        result.sanitizedError = 'BLOB_CLEANUP_FAILED';
      }
    }

    try {
      const { error: removeError } = await withTimeout(
        () => supabase.storage.from(SUPABASE_BUCKET).remove([supabaseObjectPath]),
        STEP_TIMEOUT_MS,
      );

      if (removeError && !isMissingObjectError(removeError)) {
        throw removeError;
      }

      result.supabaseCleanup = true;
    } catch {
      result.supabaseCleanup = false;
      if (
        result.sanitizedError === null ||
        (result.supabaseContentVerified && result.blobCleanup)
      ) {
        result.sanitizedError = 'SUPABASE_CLEANUP_FAILED';
      }
    }
  }

  if (
    result.blobUpload &&
    result.blobRead &&
    result.blobContentVerified &&
    result.supabaseUpload &&
    result.supabaseRead &&
    result.supabaseContentVerified &&
    result.blobCleanup &&
    result.supabaseCleanup
  ) {
    result.sanitizedError = null;
  }

  return finish();
}
