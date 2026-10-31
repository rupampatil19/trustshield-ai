import { useState } from 'react';
import { scanDeepfakeVideo } from '../services/api';

export default function DeepfakePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault(); if(!file) return;
    setLoading(true); setData(null);
    try { setData(await scanDeepfakeVideo(file)); } catch(e) { alert('Error'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Deepfake Video Scan</h1>
        <p className="text-slate-500 mt-1">Run the TrushsheildAI video pipeline (validation, sampling, inference, aggregation).</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handle}>
          <label className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all block mb-6 group">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <strong className="block text-slate-700 text-lg mb-1">{file ? file.name : "Choose a video file"}</strong>
            <span className="text-sm text-slate-500">Supported: MP4, MOV, AVI (Max 100 MB)</span>
            <input type="file" accept="video/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>

          <button disabled={loading || !file} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing Pipeline...</> : 'Run Deepfake Pipeline'}
          </button>
        </form>
      </div>

      {data && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <div>
               <h3 className="text-lg font-bold text-slate-900">Pipeline Result</h3>
               <p className="text-sm text-slate-500">Module: {data.module}</p>
             </div>
             <span className={`px-3 py-1 rounded-full text-sm font-bold ${data.label === 'INCONCLUSIVE' ? 'bg-slate-200 text-slate-700' : data.label === 'FLAGGED_FOR_REVIEW' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{String(data.label).toUpperCase()}</span>
          </div>
          
          <div className="p-6">
            {data.model?.is_mock && (
              <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex gap-3">
                <span className="text-amber-500 text-xl">⚠</span>
                <div>
                  <h4 className="font-bold text-amber-800">Mock Detector in Use</h4>
                  <p className="text-sm text-amber-700 mt-1">This pipeline is running with a development mock. Results have no real validity.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Frames Analyzed</p><p className="text-2xl font-bold text-slate-900">{data.frames_analyzed}</p></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Unscorable</p><p className="text-2xl font-bold text-slate-900">{data.frames_unscorable}</p></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Mean Score</p><p className="text-2xl font-bold text-slate-900">{data.aggregation?.mean_score ? data.aggregation.mean_score.toFixed(4) : '—'}</p></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase">Runtime</p><p className="text-2xl font-bold text-slate-900">{data.runtime_seconds ? data.runtime_seconds.toFixed(2) + 's' : '—'}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}