import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePdfReport(scanType: string, data: any) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("TrustShield AI - Investigation Report", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Scan Type: ${scanType}`, 14, 28);
  doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 34);
  doc.text(`Scan ID: ${data.scan_id || 'N/A'}`, 14, 40);

  // Risk Summary Box
  const isHigh = data.label === 'HIGH' || data.label === 'flagged_for_review';
  const isMed = data.label === 'MEDIUM';
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(14, 48, 182, 25, 'FD');

  doc.setFontSize(14);
  if (isHigh) doc.setTextColor(185, 28, 28); // red-700
  else if (isMed) doc.setTextColor(180, 83, 9); // amber-700
  else doc.setTextColor(4, 120, 87); // emerald-700

  doc.text(`Risk Assessment: ${data.label?.toUpperCase() || 'UNKNOWN'}`, 18, 58);
  
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  const target = data.url_analysed || data.message_preview || data._input_filename || 'N/A';
  doc.text(`Target: ${target}`, 18, 66);

  // Indicators Table
  let currentY = 85;
  if (data.evidence && data.evidence.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Detected Indicators", 14, currentY);
    
    const indicatorData = data.evidence.map((ind: any) => [
      ind.code,
      ind.description,
      ind.risk_contribution
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Code', 'Description', 'Risk']],
      body: indicatorData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }, // slate-800
      styles: { fontSize: 9 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Recommended Actions", 14, currentY);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    let recY = currentY + 8;
    
    data.recommendations.forEach((rec: string) => {
      const splitText = doc.splitTextToSize(`- ${rec}`, 180);
      doc.text(splitText, 14, recY);
      recY += (splitText.length * 5) + 3;
    });
    currentY = recY + 10;
  }

  // Limitations
  if (data.limitations) {
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    const limitationsText = Array.isArray(data.limitations) ? data.limitations.join(' | ') : data.limitations;
    const splitLim = doc.splitTextToSize(`LIMITATIONS: ${limitationsText}`, 180);
    doc.text(splitLim, 14, currentY);
  }

  doc.save(`TrustShield-Report-${data.scan_id?.slice(0,8) || Date.now()}.pdf`);
}