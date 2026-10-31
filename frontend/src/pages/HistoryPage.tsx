import { useState, useEffect } from 'react';
import axios from 'axios';



export default function HistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('ts_token');
      const res = await axios.get(`/api/v1/investigations`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Ensure it's an array
      if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

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

      {error && (
         <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
            {error}
         </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && data.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Loading records...</div>
        ) : data.length === 0 ? (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((scan: any, i: number) => {
                  // Safely extract values with fallbacks
                  const label = scan?.label || scan?.status || 'N/A';
                  const isHigh = label.toUpperCase() === 'HIGH' || label.toLowerCase() === 'flagged_for_review';
                  const isMed = label.toUpperCase() === 'MEDIUM';
                  const moduleName = scan?.module || 'Unknown Module';
                  const target = scan?.url_analysed || scan?.message_preview || scan?._input_filename || scan?.filename || 'N/A';
                  
                  // Safely format the date
                  let dateStr = 'Unknown Date';
                  if (scan?._db_created_at) {
                      try {
                          dateStr = new Date(scan._db_created_at).toLocaleString();
                      } catch (e) {}
                  }

                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-900">{moduleName}</td>
                      <td className="py-4 px-6 text-sm text-slate-600 max-w-xs truncate" title={target}>{target}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${isHigh ? 'bg-red-100 text-red-700' : isMed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {label.toUpperCase()}
                        </span>
                      </td>
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