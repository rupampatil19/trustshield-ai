import { useState } from 'react';
import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');



export default function TrustVerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setData(null);
    try {
      const token = localStorage.getItem('ts_token');
      const fd = new FormData();
      fd.append('file', file);
      
      const res = await axios.post(`/api/v1/trust/verify`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setData(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trust Checks</h1>
        <p className="text-slate-500 mt-1">Verify file integrity (SHA-256), extract metadata, and inspect C2PA Content Credentials.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleVerify}>
          <label className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all block mb-6 group">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <strong className="block text-slate-700 text-lg mb-1">{file ? file.name : "Choose a file to verify"}</strong>
            <span className="text-sm text-slate-500">Supported: Images (JPG, PNG)</span>
            <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>

          <button type="submit" disabled={!file || loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Run Trust Verification'}
          </button>
        </form>
      </div>

      {data && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-900">Verification Results</h3>
             <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700">COMPLETED</span>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">File Integrity (SHA-256)</h4>
              <code className="block bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono text-purple-700 break-all">{data.sha256}</code>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">C2PA Provenance</h4>
                <div className={`p-4 rounded-xl border text-sm font-semibold ${
                  data.c2pa?.status === 'valid_credential' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                  data.c2pa?.status === 'not_found' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                  'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  Status: {data.c2pa?.status?.toUpperCase().replace('_', ' ') || 'UNKNOWN'}
                  {data.c2pa?.message && <p className="text-xs font-normal mt-1">{data.c2pa.message}</p>}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Extracted Metadata</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                  {data.metadata?.error ? <p className="text-red-500">{data.metadata.error}</p> : (
                    <ul className="space-y-1">
                      <li><strong className="text-slate-500">Format:</strong> {data.metadata?.format}</li>
                      <li><strong className="text-slate-500">Dimensions:</strong> {data.metadata?.size?.join('x')}</li>
                      {data.metadata?.exif?.Make && <li><strong className="text-slate-500">Camera:</strong> {data.metadata.exif.Make} {data.metadata.exif.Model}</li>}
                      {data.metadata?.exif?.Software && <li><strong className="text-slate-500">Software:</strong> {data.metadata.exif.Software}</li>}
                      {!data.metadata?.exif && <li className="text-slate-400 italic">No EXIF metadata found.</li>}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Responsible AI Notice</h4>
              <ul className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {data.limitations?.map((lim: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600"><span className="text-slate-400">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢</span> {lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}