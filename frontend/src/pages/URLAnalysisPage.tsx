import { useState } from 'react';
import { analyseURL } from '../services/api';
import { generatePdfReport } from '../utils/pdfGenerator';

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
        <p className="text-slate-500 mt-1">Analyze URLs for phishing indicators using our rule-based engine.</p>
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
              <div className="text-right flex flex-col items-end">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Score</p>
                <p className="text-3xl font-bold text-slate-900">{(data.score * 100).toFixed(1)}%</p>
                <button onClick={() => generatePdfReport('Cyber URL', data)} className="mt-2 text-xs font-semibold bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition shadow-sm">Download PDF</button>
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
                    <span><strong className="text-slate-900">{ind.code}:</strong> {ind.description}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {data.recommendations?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {data.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600"><span className="text-slate-400">→</span> {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}