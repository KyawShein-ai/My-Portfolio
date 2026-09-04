import { useState } from 'react';
import { upload } from '@vercel/blob/client';

const PATH_PREFIX = '__feasibility/client-upload/';
const MAX_BYTES = 5 * 1024 * 1024;
const AUTH_HEADER = 'x-blob-feasibility-test-key';
const HANDLE_UPLOAD_URL = '/api/blob-client-upload-test';
const VERIFY_URL = '/api/blob-client-upload-verify-test';

const initialFlags = () => ({
  clientValidationPassed: false,
  tokenGenerationPassed: false,
  directPrivateBlobUploadPassed: false,
  serverVerificationPassed: false,
  cleanupPassed: false,
});

const buildPathname = (file) => {
  const parts = file.name.split('.');
  const ext = parts.length > 1 ? parts.pop() : 'bin';
  const safeExt = String(ext).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'bin';
  return `${PATH_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
};

export default function BlobClientUploadFeasibilityTest() {
  const [testKey, setTestKey] = useState('');
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [flags, setFlags] = useState(initialFlags);
  const [pathname, setPathname] = useState(null);
  const [sanitizedError, setSanitizedError] = useState(null);
  const [message, setMessage] = useState(
    'Isolated feasibility harness. Paste the server test key at runtime — it is never stored in source.',
  );

  const onFileChange = (event) => {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setFlags(initialFlags());
    setPathname(null);
    setSanitizedError(null);
  };

  const runTest = async () => {
    setRunning(true);
    setFlags(initialFlags());
    setPathname(null);
    setSanitizedError(null);
    setMessage('Running…');

    try {
      if (!testKey) {
        throw Object.assign(new Error('TEST_KEY_REQUIRED'), { sanitized: true });
      }
      if (!file) {
        throw Object.assign(new Error('FILE_REQUIRED'), { sanitized: true });
      }
      if (!file.type.startsWith('image/')) {
        throw Object.assign(new Error('CLIENT_VALIDATION_TYPE'), { sanitized: true });
      }
      if (file.size > MAX_BYTES) {
        throw Object.assign(new Error('CLIENT_VALIDATION_SIZE'), { sanitized: true });
      }

      setFlags((prev) => ({ ...prev, clientValidationPassed: true }));

      const requestedPathname = buildPathname(file);
      const authHeaders = { [AUTH_HEADER]: testKey };

      let blob;
      try {
        blob = await upload(requestedPathname, file, {
          access: 'private',
          handleUploadUrl: HANDLE_UPLOAD_URL,
          headers: authHeaders,
          contentType: file.type || undefined,
        });
      } catch {
        setFlags((prev) => ({
          ...prev,
          tokenGenerationPassed: false,
          directPrivateBlobUploadPassed: false,
        }));
        throw Object.assign(new Error('CLIENT_UPLOAD_FAILED'), { sanitized: true });
      }

      const uploadedPathname =
        typeof blob?.pathname === 'string' && blob.pathname.startsWith(PATH_PREFIX)
          ? blob.pathname
          : null;

      if (!uploadedPathname) {
        throw Object.assign(new Error('UPLOAD_PATHNAME_INVALID'), { sanitized: true });
      }

      setPathname(uploadedPathname);
      setFlags((prev) => ({
        ...prev,
        tokenGenerationPassed: true,
        directPrivateBlobUploadPassed: true,
      }));

      const verifyRes = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ pathname: uploadedPathname }),
      });

      let verifyJson = null;
      try {
        verifyJson = await verifyRes.json();
      } catch {
        throw Object.assign(new Error('VERIFY_RESPONSE_INVALID'), { sanitized: true });
      }

      const verified = Boolean(verifyJson?.verified);
      const cleanedUp = Boolean(verifyJson?.cleanedUp);

      setFlags((prev) => ({
        ...prev,
        serverVerificationPassed: verified,
        cleanupPassed: cleanedUp,
      }));

      if (!verifyRes.ok || !verifyJson?.success) {
        setSanitizedError(verifyJson?.sanitizedError || 'VERIFY_FAILED');
        setMessage('Feasibility test failed during server verification.');
        return;
      }

      setSanitizedError(null);
      setMessage('Feasibility test passed: private client upload + server verify + cleanup.');
    } catch (error) {
      const code = error?.sanitized ? error.message : 'UNEXPECTED_CLIENT_ERROR';
      setSanitizedError(code);
      setMessage('Feasibility test failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Isolated feasibility test
          </p>
          <h1 className="text-2xl font-semibold">Private Vercel Blob client upload</h1>
          <p className="text-sm text-slate-400">
            Browser → private Blob (direct) → server verify → cleanup. Image bytes must not
            pass through a Function body. Production Contact UI is untouched.
          </p>
        </header>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Temporary test key (runtime only)</span>
          <input
            type="password"
            autoComplete="off"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            placeholder="Paste BLOB_FEASIBILITY_TEST_KEY value"
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
          <span className="block text-xs text-slate-500">
            Entered only in this session. Not read from env in the browser. Not committed.
          </span>
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Image file (≤ 5 MiB)</span>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-sm text-slate-300"
          />
          {file ? (
            <span className="block text-xs text-slate-500">
              Selected: {file.name} · {file.type || 'unknown'} · {file.size} bytes
            </span>
          ) : null}
        </label>

        <button
          type="button"
          disabled={running}
          onClick={runTest}
          className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run client-upload feasibility test'}
        </button>

        <section className="space-y-2 rounded border border-slate-800 bg-slate-900/60 p-4 text-sm">
          <p>{message}</p>
          {pathname ? (
            <p className="text-slate-400 break-all">Pathname: {pathname}</p>
          ) : null}
          {sanitizedError ? (
            <p className="text-rose-400">Error: {sanitizedError}</p>
          ) : null}
          <ul className="mt-3 space-y-1 font-mono text-xs">
            <li>clientValidationPassed: {String(flags.clientValidationPassed)}</li>
            <li>tokenGenerationPassed: {String(flags.tokenGenerationPassed)}</li>
            <li>
              directPrivateBlobUploadPassed: {String(flags.directPrivateBlobUploadPassed)}
            </li>
            <li>serverVerificationPassed: {String(flags.serverVerificationPassed)}</li>
            <li>cleanupPassed: {String(flags.cleanupPassed)}</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
