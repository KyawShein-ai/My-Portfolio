const EXPECTED_SUPABASE_URL = 'https://lxtlbdwetbdkapskkpou.supabase.co';
const REQUEST_PATH = '/rest/v1/projects?select=id&limit=1';
const REQUEST_TIMEOUT_MS = 10000;

const diagnostic = (overrides = {}) => ({
  success: false,
  upstreamStatus: null,
  rowCount: 0,
  durationMs: 0,
  sanitizedError: 'UNKNOWN_ERROR',
  ...overrides,
});

const classifyNetworkError = (error) => {
  const code = error?.cause?.code;

  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return 'DNS_FAILURE';
  }

  if (code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'EHOSTUNREACH' || code === 'ENETUNREACH') {
    return 'TCP_CONNECTION_FAILURE';
  }

  if (code === 'CERT_HAS_EXPIRED' || code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
    return 'TLS_FAILURE';
  }

  if (code === 'UND_ERR_CONNECT_TIMEOUT' || error?.name === 'AbortError') {
    return 'TIMEOUT';
  }

  return 'UNKNOWN_ERROR';
};

const classifyHttpError = (status) => {
  if ([401, 403, 404, 500].includes(status)) {
    return `HTTP_${status}`;
  }

  if (status >= 400 && status < 600) {
    return 'POSTGREST_ERROR';
  }

  return 'UNKNOWN_ERROR';
};

export default async function handler(request, response) {
  const startedAt = Date.now();
  const finish = (result) => response.status(result.httpStatus || (result.success ? 200 : 500)).json({
    success: result.success,
    upstreamStatus: result.upstreamStatus,
    rowCount: result.rowCount,
    durationMs: Date.now() - startedAt,
    sanitizedError: result.sanitizedError,
  });

  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    return finish({
      ...diagnostic({ sanitizedError: 'UNKNOWN_ERROR' }),
      httpStatus: 405,
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return finish({
      ...diagnostic({ sanitizedError: 'MISSING_SERVER_ENV' }),
      httpStatus: 500,
    });
  }

  if (supabaseUrl !== EXPECTED_SUPABASE_URL) {
    return finish({
      ...diagnostic({ sanitizedError: 'INVALID_SUPABASE_URL' }),
      httpStatus: 500,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(`${supabaseUrl}${REQUEST_PATH}`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      signal: controller.signal,
    });

    const responseText = await upstreamResponse.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = null;
    }

    if (!upstreamResponse.ok) {
      return finish({
        ...diagnostic({
          upstreamStatus: upstreamResponse.status,
          sanitizedError: classifyHttpError(upstreamResponse.status),
        }),
        httpStatus: 502,
      });
    }

    return finish({
      success: true,
      upstreamStatus: upstreamResponse.status,
      rowCount: Array.isArray(responseData) ? responseData.length : 0,
      sanitizedError: null,
      httpStatus: 200,
    });
  } catch (error) {
    const sanitizedError = classifyNetworkError(error);
    const httpStatus = sanitizedError === 'TIMEOUT' ? 504 : 502;

    return finish({
      ...diagnostic({ sanitizedError }),
      httpStatus,
    });
  } finally {
    clearTimeout(timeout);
  }
}
