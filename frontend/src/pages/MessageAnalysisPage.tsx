import { useState } from 'react';
import { analyseMessage, getIncidentGuidance, generateReport } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MessageAnalysisPage() {
  const [msg, setMsg] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Incident Response State
  const [incidentData, setIncidentData] = useState<any>(null);
  const [incidentLoading, setIncidentLoading] = useState(false);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault(); if(!msg) return;
    setLoading(true);
    setIncidentData(null);
    try { 
      setData(await analyseMessage(msg)); 
    } catch(e) { 
      alert('Error analyzing message'); 
    } finally { 
      setLoading(false); 
    }
  }

  async function handleIncidentResponse() {
    if (!data) return;
    setIncidentLoading(true);
    try {
      const codes = data.evidence.map((e: any) => e.code);
      const result = await getIncidentGuidance(codes, 'MESSAGE');
      setIncidentData(result);
    } catch (err) {
      alert('Failed to load incident guidance. Please try again.');
    } finally {
      setIncidentLoading(false);
    }
  }

  async function handleDownloadReport() {
    if (!data) return;
    try {
      const result = await generateReport('message', data);
      const report = result.report_data;

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text("VeriSafe - Cyber Resilience Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report ID: ${report.report_id}`, 14, 28);
      doc.text(`Generated At: ${new Date(report.generated_at).toLocaleString()}`, 14, 34);
      doc.text(`Scan Type: ${report.scan_type}`, 14, 40);

      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.rect(14, 48, 182, 25, 'FD');

      doc.setFontSize(14);
      const isHigh = report.summary.risk_label === 'HIGH';
      doc.setTextColor(isHigh ? 200 : 20, 0, 0);
      doc.text(`Risk Assessment: ${report.summary.risk_label} (${(report.summary.risk_score * 100).toFixed(1)}%)`, 18, 58);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Input Analysed: ${report.input}`, 18, 66);

      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("Detected Indicators", 14, 85);

      const indicatorData = report.indicators.map((ind: any) => [
        ind.code, ind.description, ind.risk_contribution
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['Code', 'Description', 'Risk Level']],
        body: indicatorData,
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40] },
      });

      let finalY = (doc as any).lastAutoTable.finalY + 15;
      if (finalY > 250) { doc.addPage(); finalY = 20; }

      doc.setFontSize(14);
      doc.text("Recommendations", 14, finalY);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      let recY = finalY + 8;

      report.recommendations.forEach((rec: string) => {
        const splitText = doc.splitTextToSize(`- ${rec}`, 180);
        doc.text(splitText, 14, recY);
        recY += (splitText.length * 5) + 3;
      });

      if (recY > 260) { doc.addPage(); recY = 20; }

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const splitDisclaimer = doc.splitTextToSize(report.disclaimer, 180);
      doc.text(splitDisclaimer, 14, recY + 10);

      doc.save(`VeriSafe-Report-${report.report_id}.pdf`);
    } catch (err) {
      alert('Failed to generate report. Please try again.');
    }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Message Scan</h1>
        <p className="text-slate-500 mt-1">Analyze text for phishing patterns, urgency, and suspicious links.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleScan}>
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
            
            <div className="flex gap-3 mt-6">
               <button onClick={handleDownloadReport} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Download PDF Report
               </button>
               <button onClick={handleIncidentResponse} disabled={incidentLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                 {incidentLoading ? 'Loading...' : '🚨 Emergency Response'}
               </button>
            </div>
          </div>
          
          {incidentData && (
            <div className="p-6 bg-red-50 border-b border-red-100 animate-fade-in">
              <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                Emergency Response Plan ({incidentData.severity})
              </h3>
              <p className="text-sm text-red-600 mb-4">{incidentData.disclaimer}</p>
              <div className="space-y-3">
                {incidentData.actions.map((action: any) => (
                  <div key={action.step} className="flex gap-3 bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {action.step}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{action.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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