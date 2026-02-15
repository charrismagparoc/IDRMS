// ============================================================
// IDRMS — PDF Report Generator
// Uses jsPDF + jspdf-autotable
// ============================================================
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  red:    [230, 57,  70],
  orange: [244, 162, 97],
  yellow: [249, 199, 79],
  green:  [6,   214, 160],
  blue:   [76,  201, 240],
  purple: [123, 94,  167],
  dark:   [10,  14,  26],
  panel:  [17,  24,  39],
  card:   [26,  34,  53],
  light:  [232, 234, 240],
  muted:  [136, 146, 164],
};

const fmt = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-PH', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch { return iso; }
};

function addHeader(doc, title, subtitle) {
  const pw = doc.internal.pageSize.getWidth();

  // Dark header band
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pw, 36, 'F');

  // Red accent bar
  doc.setFillColor(...COLORS.red);
  doc.rect(0, 36, pw, 3, 'F');

  // Shield icon circle
  doc.setFillColor(...COLORS.red);
  doc.circle(18, 18, 10, 'F');

  // Title
  doc.setTextColor(...COLORS.light);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('IDRMS', 32, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text('Barangay Kauswagan, Cagayan de Oro City, Misamis Oriental', 32, 22);
  doc.text(`Generated: ${new Date().toLocaleString('en-PH')}`, 32, 29);

  // Report title (right side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.blue);
  doc.text(title, pw - 14, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(subtitle, pw - 14, 22, { align: 'right' });

  return 48; // return Y position after header
}

function addSectionTitle(doc, text, y, color = COLORS.blue) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...color, 0.15);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y - 5, pw - 28, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...color);
  doc.text(text.toUpperCase(), 18, y + 1);
  return y + 10;
}

function addStatRow(doc, stats, y) {
  const pw = doc.internal.pageSize.getWidth();
  const w  = (pw - 28) / stats.length;
  stats.forEach((s, i) => {
    const x = 14 + i * w;
    doc.setFillColor(...COLORS.card);
    doc.setDrawColor(...COLORS.panel);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, w - 4, 22, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...(s.color || COLORS.blue));
    doc.text(String(s.value), x + (w-4)/2, y + 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(s.label.toUpperCase(), x + (w-4)/2, y + 19, { align: 'center' });
  });
  return y + 28;
}

function addFooter(doc) {
  const pw  = doc.internal.pageSize.getWidth();
  const ph  = doc.internal.pageSize.getHeight();
  const pgs = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pgs; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, ph - 12, pw, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text('IDRMS — Barangay Kauswagan Disaster Risk Management System  |  CONFIDENTIAL', 14, ph - 4);
    doc.text(`Page ${i} of ${pgs}`, pw - 14, ph - 4, { align: 'right' });
  }
}

// ─── TABLE STYLES ────────────────────────────────────────────
const tableStyles = {
  styles:         { fontSize: 8, cellPadding: 3, textColor: COLORS.light, lineColor: COLORS.panel, lineWidth: 0.2 },
  headStyles:     { fillColor: COLORS.dark, textColor: COLORS.blue, fontStyle: 'bold', fontSize: 8, cellPadding: 4 },
  alternateRowStyles: { fillColor: COLORS.card },
  bodyStyles:     { fillColor: COLORS.panel },
  margin:         { left: 14, right: 14 },
};

// ─── BADGE CELL helper ────────────────────────────────────────
const badgeColor = (val) => {
  const v = (val||'').toLowerCase();
  if (['active','high','danger','unaccounted','full'].some(k=>v.includes(k))) return [230,57,70];
  if (['pending','medium','warning','partially'].some(k=>v.includes(k))) return [244,162,97];
  if (['resolved','low','safe','open','available'].some(k=>v.includes(k))) return [6,214,160];
  if (['verified','advisory','info','evacuated'].some(k=>v.includes(k))) return [76,201,240];
  return [136,146,164];
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT FUNCTION
// ─────────────────────────────────────────────────────────────
export function exportFullReport({ incidents, alerts, evacCenters, residents, resources, actLog }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();

  // ── PAGE 1: EXECUTIVE SUMMARY ────────────────────────────
  let y = addHeader(doc, 'EXECUTIVE SUMMARY', `Disaster Management Report`);

  y = addStatRow(doc, [
    { label: 'Total Incidents',    value: incidents.length,                             color: COLORS.orange },
    { label: 'Active / Pending',   value: incidents.filter(i=>['Active','Pending'].includes(i.status)).length, color: COLORS.red },
    { label: 'Resolved',           value: incidents.filter(i=>i.status==='Resolved').length, color: COLORS.green },
    { label: 'Active Alerts',      value: alerts.filter(a=>a.level!=='Resolved').length,      color: COLORS.red },
    { label: 'Open Evac Centers',  value: evacCenters.filter(c=>c.status==='Open').length,    color: COLORS.green },
  ], y);

  y = addStatRow(doc, [
    { label: 'Total Residents',   value: residents.length,                                    color: COLORS.purple },
    { label: 'Evacuated',         value: residents.filter(r=>r.evacuationStatus==='Evacuated').length, color: COLORS.blue },
    { label: 'Safe',              value: residents.filter(r=>r.evacuationStatus==='Safe').length,       color: COLORS.green },
    { label: 'Unaccounted',       value: residents.filter(r=>r.evacuationStatus==='Unaccounted').length, color: COLORS.red },
    { label: 'Vulnerable',        value: residents.filter(r=>r.vulnerabilityTags?.length>0).length,      color: COLORS.orange },
  ], y + 2);

  y += 6;

  // Incident types breakdown
  y = addSectionTitle(doc, '  Incident Breakdown by Type', y + 4, COLORS.orange);
  const types = ['Flood','Fire','Landslide','Storm','Earthquake'];
  const typeColors = { Flood: COLORS.blue, Fire: COLORS.red, Landslide: COLORS.orange, Storm: COLORS.yellow, Earthquake: COLORS.purple };
  const maxInc = Math.max(...types.map(t => incidents.filter(i=>i.type===t).length), 1);
  const barW   = (pw - 80) / 1;

  types.forEach(t => {
    const cnt  = incidents.filter(i=>i.type===t).length;
    const pct  = cnt / maxInc;
    const color = typeColors[t];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(t, 18, y + 4);
    doc.setFillColor(...COLORS.panel);
    doc.roundedRect(55, y, barW, 6, 1, 1, 'F');
    doc.setFillColor(...color);
    doc.roundedRect(55, y, Math.max(barW * pct, 0.5), 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...color);
    doc.text(String(cnt), 55 + barW + 4, y + 4.5);
    y += 9;
  });

  // Zone risk table
  y = addSectionTitle(doc, '  Zone Risk Assessment', y + 4, COLORS.red);
  autoTable(doc, {
    startY: y,
    head: [['Zone', 'Risk Level', 'Main Hazard', 'Total Incidents', 'Recommendation']],
    body: [
      ['Zone 1', 'Medium', 'Fire',       String(incidents.filter(i=>i.zone==='Zone 1').length), 'Monitor. Pre-position fire suppression.'],
      ['Zone 2', 'Low',    'Flood',      String(incidents.filter(i=>i.zone==='Zone 2').length), 'Continue standard monitoring.'],
      ['Zone 3', 'High',   'Flood',      String(incidents.filter(i=>i.zone==='Zone 3').length), 'Pre-position rescue team. Evacuation standby.'],
      ['Zone 4', 'Low',    'Earthquake', String(incidents.filter(i=>i.zone==='Zone 4').length), 'Structural inspection after events.'],
      ['Zone 5', 'High',   'Landslide',  String(incidents.filter(i=>i.zone==='Zone 5').length), 'Block hillside roads. Mandatory evac ready.'],
      ['Zone 6', 'Medium', 'Storm',      String(incidents.filter(i=>i.zone==='Zone 6').length), 'Coastal monitoring. Prepare relief goods.'],
    ],
    ...tableStyles,
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === 'body') {
        const c = badgeColor(data.cell.raw);
        data.cell.styles.textColor = c;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── PAGE 2: INCIDENTS ────────────────────────────────────
  doc.addPage();
  y = addHeader(doc, 'INCIDENT REPORT', `Total Records: ${incidents.length}`);

  y = addSectionTitle(doc, '  All Incidents', y, COLORS.orange);
  autoTable(doc, {
    startY: y,
    head: [['ID', 'Type', 'Zone', 'Location', 'Severity', 'Status', 'Reporter', 'Date Reported']],
    body: incidents.map(i => [
      i.id?.slice(0,8)||'—', i.type, i.zone, i.location||'—',
      i.severity, i.status, i.reporter||'—', fmt(i.dateReported)
    ]),
    ...tableStyles,
    columnStyles: { 0:{cellWidth:18}, 3:{cellWidth:35}, 7:{cellWidth:30} },
    didParseCell: (data) => {
      if ([4,5].includes(data.column.index) && data.section==='body') {
        data.cell.styles.textColor = badgeColor(data.cell.raw);
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── PAGE 3: ALERTS ───────────────────────────────────────
  doc.addPage();
  y = addHeader(doc, 'ALERT HISTORY', `Total Alerts: ${alerts.length}`);
  y = addSectionTitle(doc, '  Alert Records', y, COLORS.red);
  autoTable(doc, {
    startY: y,
    head: [['ID', 'Level', 'Zone', 'Channel', 'Recipients', 'Sent By', 'Sent At', 'Message']],
    body: alerts.map(a => [
      a.id?.slice(0,8)||'—', a.level, a.zone||'—', a.channel||'—',
      String(a.recipientsCount||0), a.sentBy||'—', fmt(a.sentAt),
      (a.message||'—').slice(0,60)+(a.message?.length>60?'…':''),
    ]),
    ...tableStyles,
    columnStyles: { 7:{cellWidth:50} },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section==='body') {
        data.cell.styles.textColor = badgeColor(data.cell.raw);
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── PAGE 4: EVACUATION CENTERS ───────────────────────────
  doc.addPage();
  y = addHeader(doc, 'EVACUATION CENTERS', `Total Centers: ${evacCenters.length}`);

  const totalCap = evacCenters.reduce((a,c)=>a+c.capacity,0);
  const totalOcc = evacCenters.reduce((a,c)=>a+c.occupancy,0);
  y = addStatRow(doc, [
    { label: 'Total Centers',      value: evacCenters.length,                                    color: COLORS.blue },
    { label: 'Open',               value: evacCenters.filter(c=>c.status==='Open').length,        color: COLORS.green },
    { label: 'Full',               value: evacCenters.filter(c=>c.status==='Full').length,        color: COLORS.red },
    { label: 'Total Capacity',     value: totalCap,                                              color: COLORS.orange },
    { label: 'Current Evacuees',   value: totalOcc,                                              color: COLORS.blue },
  ], y);

  y += 2;
  y = addSectionTitle(doc, '  Center Details', y, COLORS.green);
  autoTable(doc, {
    startY: y,
    head: [['Name', 'Zone', 'Status', 'Capacity', 'Occupancy', '% Full', 'Contact Person', 'Facilities']],
    body: evacCenters.map(c => [
      c.name, c.zone, c.status, String(c.capacity), String(c.occupancy),
      `${Math.round((c.occupancy/c.capacity)*100)||0}%`,
      c.contactPerson||'—', (c.facilitiesAvailable||[]).join(', ')||'—'
    ]),
    ...tableStyles,
    columnStyles: { 0:{cellWidth:40}, 7:{cellWidth:35} },
    didParseCell: (data) => {
      if (data.column.index === 2 && data.section==='body') {
        data.cell.styles.textColor = badgeColor(data.cell.raw);
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 5 && data.section==='body') {
        const pct = parseInt(data.cell.raw);
        data.cell.styles.textColor = pct>=90?COLORS.red:pct>=60?COLORS.orange:COLORS.green;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── PAGE 5: RESIDENTS ────────────────────────────────────
  doc.addPage();
  y = addHeader(doc, 'RESIDENT DATABASE', `Total Records: ${residents.length}`);
  y = addSectionTitle(doc, '  Resident List', y, COLORS.purple);
  autoTable(doc, {
    startY: y,
    head: [['Name', 'Zone', 'Address', 'Household', 'Contact', 'Evac Status', 'Vulnerability Tags']],
    body: residents.map(r => [
      r.name, r.zone, r.address||'—',
      String(r.householdMembers||1), r.contact||'—',
      r.evacuationStatus, (r.vulnerabilityTags||[]).join(', ')||'None'
    ]),
    ...tableStyles,
    columnStyles: { 2:{cellWidth:35}, 6:{cellWidth:38} },
    didParseCell: (data) => {
      if (data.column.index === 5 && data.section==='body') {
        data.cell.styles.textColor = badgeColor(data.cell.raw);
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── PAGE 6: RESOURCES ────────────────────────────────────
  doc.addPage();
  y = addHeader(doc, 'RESOURCE INVENTORY', `Total Items: ${resources.length}`);
  y = addSectionTitle(doc, '  Resource List', y, COLORS.blue);
  autoTable(doc, {
    startY: y,
    head: [['Name', 'Category', 'Total Qty', 'Available', 'Availability %', 'Status', 'Storage Location']],
    body: resources.map(r => [
      r.name, r.category, String(r.quantity), String(r.available),
      `${r.quantity>0?Math.round((r.available/r.quantity)*100):0}%`,
      r.status, r.location||'—'
    ]),
    ...tableStyles,
    didParseCell: (data) => {
      if (data.column.index === 5 && data.section==='body') {
        data.cell.styles.textColor = badgeColor(data.cell.raw);
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 4 && data.section==='body') {
        const pct = parseInt(data.cell.raw);
        data.cell.styles.textColor = pct>=70?COLORS.green:pct>=30?COLORS.orange:COLORS.red;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── PAGE 7: ACTIVITY LOG ─────────────────────────────────
  doc.addPage();
  y = addHeader(doc, 'ACTIVITY LOG', `Total Entries: ${actLog.length}`);
  y = addSectionTitle(doc, '  System Activity', y, COLORS.muted);
  autoTable(doc, {
    startY: y,
    head: [['Log ID', 'Action', 'Type', 'User', 'Timestamp']],
    body: actLog.slice(0, 100).map(l => [
      (l.id||'—').slice(0,8), l.action||'—', l.type||'—', l.user||'—', fmt(l.time)
    ]),
    ...tableStyles,
    columnStyles: { 1:{cellWidth:65} },
    didParseCell: (data) => {
      if (data.column.index === 2 && data.section==='body') {
        data.cell.styles.textColor = badgeColor(data.cell.raw);
      }
    },
  });

  addFooter(doc);

  const date = new Date().toISOString().slice(0,10);
  doc.save(`IDRMS_Report_${date}.pdf`);
}

// ─── Quick single-page exports ───────────────────────────────
export function exportIncidentsReport(incidents) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let y = addHeader(doc, 'INCIDENT REPORT', `${incidents.length} Records  |  Brgy. Kauswagan`);
  y = addSectionTitle(doc, '  Incident Records', y, COLORS.orange);
  autoTable(doc, {
    startY: y,
    head: [['ID','Type','Zone','Location','Severity','Status','Reporter','Date Reported','Description']],
    body: incidents.map(i=>[
      i.id?.slice(0,8)||'—', i.type, i.zone, i.location||'—',
      i.severity, i.status, i.reporter||'—', fmt(i.dateReported),
      (i.description||'—').slice(0,50)
    ]),
    ...tableStyles,
    columnStyles: { 3:{cellWidth:32}, 8:{cellWidth:50} },
    didParseCell: d => {
      if ([4,5].includes(d.column.index) && d.section==='body') { d.cell.styles.textColor=badgeColor(d.cell.raw); d.cell.styles.fontStyle='bold'; }
    },
  });
  addFooter(doc);
  doc.save(`IDRMS_Incidents_${new Date().toISOString().slice(0,10)}.pdf`);
}

export function exportResidentsReport(residents) {
  const doc = new jsPDF({ orientation: 'landscape', unit:'mm', format:'a4' });
  let y = addHeader(doc, 'RESIDENT DATABASE REPORT', `${residents.length} Records  |  Brgy. Kauswagan`);
  y = addSectionTitle(doc, '  Resident Records', y, COLORS.purple);
  autoTable(doc, {
    startY: y,
    head: [['Name','Zone','Address','Household Mbrs','Contact','Evac Status','Vulnerability Tags']],
    body: residents.map(r=>[r.name, r.zone, r.address||'—', String(r.householdMembers||1), r.contact||'—', r.evacuationStatus, (r.vulnerabilityTags||[]).join(', ')||'None']),
    ...tableStyles,
    didParseCell: d => { if (d.column.index===5 && d.section==='body') { d.cell.styles.textColor=badgeColor(d.cell.raw); d.cell.styles.fontStyle='bold'; } },
  });
  addFooter(doc);
  doc.save(`IDRMS_Residents_${new Date().toISOString().slice(0,10)}.pdf`);
}
