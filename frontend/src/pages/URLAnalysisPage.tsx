import { useState } from 'react';
import { analyseURL } from '../services/api';

export default function URLAnalysisPage() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault(); if(!url) return;
    setLoading(true);
    try { setData(await analyseURL(url)); } catch(e) { alert('Error'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cyber Scan</h1>
        <p className="text-slate-500 mt-1">Analyze URLs for phishing indicators using rule-based heuristics.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handle}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">URL to Analyze</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input type="text" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/login" className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
            <button disabled={loading || !url} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50">
              {loading ? 'Scanning...' : 'Analyze'}
            </button>
          </div>
        </form>
      </div>

      {data && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className={`p-6 border-b ${data.label === 'HIGH' ? 'bg-red-50 border-red-100' : data.label === 'MEDIUM' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Analysis Result</p>
                <h3 className={`text-2xl font-bold ${data.label === 'HIGH' ? 'text-red-700' : data.label === 'MEDIUM' ? 'text-amber-700' : 'text-emerald-700'}`}>{data.label} RISK</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Score</p>
                <p className="text-3xl font-black text-slate-900">{(data.score * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 font-semibold uppercase">Malicious Probability</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Extracted Evidence
              </h4>
              <ul className="space-y-2">
                {data.evidence?.map((ind: any, i: number) => (
                  <li key={i} className="flex flex-col gap-2 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex gap-2 items-center">
                      <span className="text-purple-500 font-bold">•</span> 
                      <strong className="text-slate-900">{ind.code}</strong>
                    </div>
                    <p className="pl-5 text-slate-600">{ind.description}</p>
                    {ind.matched_text && (
                      <div className="pl-5 mt-1">
                        <span className="text-xs font-semibold text-slate-500">Matched Pattern: </span>
                        <code className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{ind.matched_text}</code>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}