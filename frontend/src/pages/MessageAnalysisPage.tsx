import { useState } from 'react';
import { analyseMessage } from '../services/api';

export default function MessageAnalysisPage() {
  const [msg, setMsg] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault(); if(!msg) return;
    setLoading(true);
    try { setData(await analyseMessage(msg)); } catch(e) { alert('Error'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Message Scan</h1>
        <p className="text-slate-500 mt-1">Analyze text for phishing patterns, urgency, and suspicious links.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handle}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Message Text</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Paste suspicious SMS or email here..." rows={6} className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all mb-4" />
          <button disabled={loading || !msg} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm disabled:opacity-50">
            {loading ? 'Analyzing...' : 'Analyze Message'}
          </button>
        </form>
      </div>

      {data && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className={`p-6 border-b ${data.label === 'HIGH' ? 'bg-red-50 border-red-100' : data.label === 'MEDIUM' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Result</p>
                <h3 className={`text-2xl font-bold ${data.label === 'HIGH' ? 'text-red-700' : data.label === 'MEDIUM' ? 'text-amber-700' : 'text-emerald-700'}`}>{data.label} RISK</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Score</p>
                <p className="text-3xl font-black text-slate-900">{(data.score * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 font-semibold uppercase">Fraud Probability</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
             <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Detected Indicators</h4>
              <ul className="space-y-2">
                {data.evidence?.map((ind: any, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-purple-500 font-bold">•</span> 
                    <span><strong className="text-slate-900">{ind.code}:</strong> {ind.description} <span className="text-slate-400 text-xs ml-2">"{ind.matched_text}"</span></span>
                  </li>
                ))}
              </ul>
            </div>
            
            {data.extracted_urls?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Extracted Links</h4>
                <div className="space-y-2">
                  {data.extracted_urls.map((u: any, i: number) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                      <span className="font-mono text-purple-600 break-all">{u.url}</span>
                      {u.scan_result && <span className="ml-3 px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700">{u.scan_result.label}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}