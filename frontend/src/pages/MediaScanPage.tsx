import { useState } from 'react';
import { scanDeepfakeVideo } from '../services/api';

export default function MediaScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setResult(null);
    try {
      const res = await scanDeepfakeVideo(file);
      setResult(res);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Media Scan</h1>
        <p className="text-slate-500 mt-1">Upload an image or video to run the TrushsheildAI deepfake pipeline.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleScan}>
          <label className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all block mb-6 group">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <strong className="block text-slate-700 text-lg mb-1">{file ? file.name : "Choose an image or video"}</strong>
            <span className="text-sm text-slate-500">Supported: JPG, PNG, MP4, MOV (Max 100 MB)</span>
            <input type="file" accept="image/*,video/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>

          <button type="submit" disabled={!file || loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing Pipeline...</> : 'Run Media Scan'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <div>
               <h3 className="text-lg font-bold text-slate-900">Pipeline Result</h3>
               <p className="text-sm text-slate-500">Type: {result.media_type || 'Video'}</p>
             </div>
             {result.label && (
               <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.label.toLowerCase() === 'inconclusive' ? 'bg-slate-200 text-slate-700' : result.label.toLowerCase() === 'flagged_for_review' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{String(result.label).toUpperCase()}</span>
             )}
          </div>
          
          <div className="p-6">
            {result.model?.is_mock && (
              <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex gap-3">
                <span className="text-amber-500 text-xl">⚠</span>
                <div>
                  <h4 className="font-bold text-amber-800">Mock Detector in Use</h4>
                  <p className="text-sm text-amber-700 mt-1">This pipeline is running with a development mock. Results have no real validity.</p>
                </div>
              </div>
            )}

            {result.error ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">{result.error}</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Frames Analyzed</p><p className="text-2xl font-bold text-slate-900">{result.frames_analyzed ?? 0}</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Unscorable</p><p className="text-2xl font-bold text-slate-900">{result.frames_unscorable ?? 0}</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Score</p><p className="text-2xl font-bold text-slate-900">{result.score !== undefined && result.score !== null ? result.score.toFixed(4) : '—'}</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Runtime</p><p className="text-2xl font-bold text-slate-900">{result.runtime_seconds ? result.runtime_seconds.toFixed(2) + 's' : '—'}</p></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}