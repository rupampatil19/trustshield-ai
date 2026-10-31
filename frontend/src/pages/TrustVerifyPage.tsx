import { useState } from 'react';

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function TrustVerifyPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [hashA, setHashA] = useState<string | null>(null);
  const [hashB, setHashB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    if (!fileA) return;
    setLoading(true);
    try {
      setHashA(await sha256Hex(await fileA.arrayBuffer()));
      if (fileB) setHashB(await sha256Hex(await fileB.arrayBuffer()));
    } finally { setLoading(false); }
  }

  const match = hashA && hashB ? hashA === hashB : null;

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trust Checks</h1>
        <p className="text-slate-500 mt-1">Compute SHA-256 hashes to verify file integrity. Computation happens locally in your browser.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">File A (Required)</label>
            <input type="file" onChange={e=>setFileA(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all cursor-pointer" />
            {fileA && <p className="text-xs text-slate-500 mt-2">{fileA.name} ({(fileA.size/1024).toFixed(1)} KB)</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">File B (Optional)</label>
            <input type="file" onChange={e=>setFileB(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all cursor-pointer" />
            {fileB && <p className="text-xs text-slate-500 mt-2">{fileB.name} ({(fileB.size/1024).toFixed(1)} KB)</p>}
          </div>
        </div>
        <button onClick={verify} disabled={!fileA || loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm disabled:opacity-50">{loading ? 'Hashing...' : 'Compute SHA-256'}</button>
      </div>

      {hashA && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">File A Hash</label>
              <code className="block bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono text-purple-700 break-all">{hashA}</code>
            </div>
            {hashB && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">File B Hash</label>
                <code className="block bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono text-purple-700 break-all">{hashB}</code>
              </div>
            )}
            {match !== null && (
              <div className={`p-4 rounded-xl border font-semibold text-sm ${match ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                {match ? '✓ Hashes match — Files are byte-identical.' : '⚠ Hashes differ — Files are not identical.'}
              </div>
            )}
        </div>
      )}
    </div>
  );
}