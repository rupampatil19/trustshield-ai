import { useState, useEffect } from 'react';
import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function HistoryPage() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchHistory() {
    setLoading(true);
    try {
      const token = localStorage.getItem('ts_token');
      const res = await axios.get(`\$\{API_ORIGIN\}/api/v1/investigations`, { headers: { Authorization: `Bearer \$\{token\}` } });
      setData(res.data);
    } catch (err) { alert('Failed to fetch history'); } finally { setLoading(false); }
  }

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scan History</h1>
          <p className="text-slate-500 mt-1">Review all previous investigations across Cyber, Media, and Deepfake modules.</p>
        </div>
        <button onClick={fetchHistory} disabled={loading} className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:bg-slate-50 disabled:opacity-50">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && !data ? (
          <div className="p-12 text-center text-slate-500">Loading records...</div>
        ) : data?.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No scans found. Run a scan to see history.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk / Label</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.map((scan: any, i: number) => {
                  const isHigh = scan.label === 'HIGH' || scan.label === 'flagged_for_review';
                  const isMed = scan.label === 'MEDIUM';
                  const target = scan.url_analysed || scan.message_preview || scan._input_filename || 'N/A';
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(scan._db_created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-900">{scan.module || 'Unknown'}</td>
                      <td className="py-4 px-6 text-sm text-slate-600 max-w-xs truncate" title={target}>{target}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${isHigh ? 'bg-red-100 text-red-700' : isMed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {scan.label ? scan.label.toUpperCase() : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">{scan.scan_id?.slice(0, 8)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}