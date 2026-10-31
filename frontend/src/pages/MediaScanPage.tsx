import { useState } from 'react';
import { scanDeepfakeVideo } from '../services/api';

export default function MediaScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault(); if (!file) return;
    setLoading(true); setResult(null);
    try {
      const res = await scanDeepfakeVideo(file);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setResult({ error: err.message || "An unknown error occurred. Check backend logs." });
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Media Scan</h1>
        <p className="text-slate-500 mt-1">Run the TrushsheildAI pipeline and generate forensic visual evidence (Grad-CAM).</p>
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
            {loading ? 'Running AI Pipeline & Extracting Evidence...' : 'Run Media Scan'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <div>
               <h3 className="text-lg font-bold text-slate-900">Pipeline Result</h3>
               <p className="text-sm text-slate-500">Type: {result.video?.container === 'IMAGE' ? 'Image' : 'Video'} | Module: {result.module}</p>
             </div>
             <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.label?.toLowerCase() === 'inconclusive' ? 'bg-slate-200 text-slate-700' : result.label?.toLowerCase() === 'flagged_for_review' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{String(result.label).toUpperCase()}</span>
          </div>
          
          <div className="p-6 space-y-8">
            {result.error ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">{result.error}</div>
            ) : (
              <>
                {/* EVIDENCE DISPLAY */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Forensic Visual Evidence (Grad-CAM)
                  </h4>
                  <p className="text-sm text-slate-500 mb-4">The heatmap highlights the exact pixels the AI analyzed to reach its conclusion.</p>
                  
                  {result.evidence?.primary_evidence?.heatmap_b64 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-100 rounded-xl p-2 border border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 mb-2 text-center">Original Image + Grad-CAM Heatmap</p>
                        <img src={`data:image/jpeg;base64,${result.evidence.primary_evidence.heatmap_b64}`} alt="Grad-CAM Heatmap" className="w-full rounded-lg" />
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-center">
                        <p className="text-sm font-bold text-slate-700 mb-3">Dynamic Forensic Findings:</p>
                        <ul className="text-sm text-slate-600 space-y-3 list-disc pl-4 mb-4">
                          {result.evidence?.primary_evidence?.forensic_findings?.length > 0 ? (
                             result.evidence.primary_evidence.forensic_findings.map((finding: string, idx: number) => (
                                <li key={idx} className="font-medium text-slate-800 leading-relaxed">{finding}</li>
                             ))
                          ) : (
                             <li className="font-medium text-slate-500 italic">No specific localized anomalies exceeded the confidence threshold.</li>
                          )}
                        </ul>
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-lg text-xs text-slate-700 space-y-2">
                           <p><strong className="text-slate-900">Forensic Heatmap Interpretation:</strong></p>
                           <ul className="list-disc pl-4 space-y-1">
                              <li><strong className="text-red-600">Red Zones (Localized Anomalies):</strong> High manipulation probability. Even a small localized artifact (e.g., unnatural eye reflections or blending) is sufficient for the AI to flag the entire image as highly suspicious.</li>
                              <li><strong className="text-amber-600">Yellow/Green Zones:</strong> Moderate attention. Secondary areas of potential texture inconsistency.</li>
                              <li><strong className="text-blue-600">Blue Zones (Unaffected):</strong> The model verified that these areas contain no forgery artifacts. The background remains authentic.</li>
                           </ul>
                           <p className="mt-2 text-slate-600 italic font-medium">Note: A 100% Fake Probability indicates the model is 100% certain of the artifacts found in the Red zones, not that the entire image is manipulated.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-500 italic">Heatmap generation is only supported for single-image uploads currently.</div>
                  )}
                </div>

                {/* STATS & PERCENTAGE */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl border col-span-2 md:col-span-1 ${result.label?.toLowerCase() === 'flagged_for_review' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                     <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.label?.toLowerCase() === 'flagged_for_review' ? 'text-red-600' : 'text-emerald-600'}`}>Fake Probability</p>
                     <p className={`text-4xl font-black ${result.label?.toLowerCase() === 'flagged_for_review' ? 'text-red-700' : 'text-emerald-700'}`}>
                        {result.aggregation?.mean_score !== undefined && result.aggregation?.mean_score !== null ? (result.aggregation.mean_score * 100).toFixed(1) + '%' : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â'}
                     </p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Flag Threshold</p>
                     <p className="text-2xl font-bold text-slate-700">25.2%</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Frames Analyzed</p>
                     <p className="text-2xl font-bold text-slate-900">{result.frames_analyzed ?? 0}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unscorable</p>
                     <p className="text-2xl font-bold text-slate-900">{result.frames_unscorable ?? 0}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}