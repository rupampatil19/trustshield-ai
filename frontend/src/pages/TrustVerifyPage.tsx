import { useState } from 'react';
import type { FormEvent } from 'react';

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

export default function TrustVerifyPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [hashA, setHashA] = useState<string | null>(null);
  const [hashB, setHashB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    if (!fileA) return;
    setLoading(true);
    setError(null);
    setHashA(null);
    setHashB(null);
    try {
      const bufA = await fileA.arrayBuffer();
      setHashA(await sha256Hex(bufA));
      if (fileB) {
        const bufB = await fileB.arrayBuffer();
        setHashB(await sha256Hex(bufB));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hashing failed');
    } finally {
      setLoading(false);
    }
  }

  const match = hashA && hashB ? hashA === hashB : null;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent opacity-80" />
        <h1 className="text-2xl font-bold text-white mb-2">Trust Verification</h1>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl">
          Compute SHA-256 hashes to verify file integrity. A matching hash proves
          two files are byte-identical &mdash; it does{' '}
          <em className="text-cyan-400">not</em> prove the content is authentic
          or true. All computation happens in your browser.
        </p>

        <form onSubmit={onVerify} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-300 mb-2">
              File A (required)
            </span>
            <input
              type="file"
              onChange={(e) => setFileA(e.target.files?.[0] ?? null)}
              className="input-field"
              disabled={loading}
            />
            {fileA && (
              <p className="mt-1.5 text-xs text-slate-500">
                {fileA.name} &middot; {formatBytes(fileA.size)} &middot;{' '}
                {fileA.type || 'unknown type'}
              </p>
            )}
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-300 mb-2">
              File B (optional &mdash; for comparison)
            </span>
            <input
              type="file"
              onChange={(e) => setFileB(e.target.files?.[0] ?? null)}
              className="input-field"
              disabled={loading}
            />
            {fileB && (
              <p className="mt-1.5 text-xs text-slate-500">
                {fileB.name} &middot; {formatBytes(fileB.size)} &middot;{' '}
                {fileB.type || 'unknown type'}
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={!fileA || loading}
            className="btn-primary w-full"
          >
            {loading ? 'Computing SHA-256&hellip;' : 'Compute SHA-256'}
          </button>
        </form>
      </div>

      {error && (
        <div className="glass-panel p-5 border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {hashA && (
        <div className="glass-panel p-6 space-y-4 animate-fade-in">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              File A &mdash; SHA-256
            </p>
            <code className="block text-sm font-mono text-cyan-300 break-all bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {hashA}
            </code>
          </div>

          {hashB && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                File B &mdash; SHA-256
              </p>
              <code className="block text-sm font-mono text-cyan-300 break-all bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {hashB}
              </code>
              <div
                className={
                  'mt-3 p-3 rounded-lg text-sm font-medium ' +
                  (match
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30')
                }
              >
                {match
                  ? '\u2713 Hashes match \u2014 files are byte-identical.'
                  : '\u2717 Hashes differ \u2014 files are not identical.'}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700/50 text-xs text-slate-500 leading-relaxed space-y-1">
            <p>
              <strong className="text-slate-400">What this proves:</strong> the
              files are (or are not) byte-for-byte identical.
            </p>
            <p>
              <strong className="text-slate-400">What this does not prove:</strong>{' '}
              that the file contents are authentic, unmanipulated, or truthful.
              Integrity is not the same as authenticity. C2PA Content Credentials (not yet
              integrated) would provide provenance evidence.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}