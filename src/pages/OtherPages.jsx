import { useState } from 'react';
import '../styles/Pages.css';
import { RESOURCE_CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';
import { exportFullReport, exportIncidentsReport, exportResidentsReport } from '../lib/pdfExport';

/* ══════════════════════════════════════════════════════════════
   RESOURCES
══════════════════════════════════════════════════════════════ */
export function ResourcesPage() {
  const { resources, addResource, updateResource, deleteResource } = useApp();
  const [filterCat,  setFilterCat]  = useState('All');
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({ name:'', category:'Equipment', quantity:1, available:1, status:'Available', location:'' });

  const statusBadge = { Available:'success', Deployed:'warning', 'In Use':'danger', 'Partially Deployed':'info' };
  const filtered = filterCat === 'All' ? resources : resources.filter(r => r.category === filterCat);

  const openAdd  = () => { setEditing(null); setForm({ name:'', category:'Equipment', quantity:1, available:1, status:'Available', location:'' }); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setForm({...r}); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) await updateResource(editing.id, form);
      else         await addResource(form);
      setShowModal(false);
    } catch(e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Resource Management</div>
          <div className="page-subtitle">Track equipment, supplies, and deployment status</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="fa-solid fa-plus"></i> Add Resource</button>
      </div>

      <div className="filter-row">
        <button className={`btn btn-sm ${filterCat==='All'?'btn-primary':'btn-secondary'}`} onClick={()=>setFilterCat('All')}>All</button>
        {RESOURCE_CATEGORIES.map(c => (
          <button key={c} className={`btn btn-sm ${filterCat===c?'btn-primary':'btn-secondary'}`} onClick={()=>setFilterCat(c)}>{c}</button>
        ))}
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Resource</th><th>Category</th><th>Total</th><th>Available</th><th>Availability</th><th>Status</th><th>Location</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const pct = r.quantity > 0 ? (r.available/r.quantity)*100 : 0;
                return (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong><div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'monospace'}}>{r.id?.slice(0,8)}</div></td>
                    <td style={{color:'var(--text-secondary)',fontSize:12}}>{r.category}</td>
                    <td style={{textAlign:'center',fontWeight:700}}>{r.quantity}</td>
                    <td style={{textAlign:'center'}}>{r.available}</td>
                    <td style={{width:140}}>
                      <div className="res-status-bar">
                        <div className="res-bar-wrap">
                          <div className="res-bar" style={{width:`${pct}%`,background:pct>50?'var(--accent-green)':pct>20?'var(--accent-orange)':'var(--accent-red)'}}></div>
                        </div>
                        <span style={{fontSize:11,color:'var(--text-muted)',flexShrink:0}}>{Math.round(pct)}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${statusBadge[r.status]||'neutral'}`}>{r.status}</span></td>
                    <td style={{fontSize:12,color:'var(--text-secondary)'}}>{r.location}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-outline btn-sm" onClick={()=>openEdit(r)}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn btn-sm" style={{background:'rgba(230,57,70,.12)',color:'var(--accent-red)',border:'1px solid rgba(230,57,70,.25)'}} onClick={()=>setDeleteId(r.id)}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8}><div className="empty-state"><i className="fa-solid fa-boxes-stacked"></i><p>No resources yet. Add one above.</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && <ConfirmModal title="Delete Resource" message="Remove this resource?" onConfirm={async()=>{try{await deleteResource(deleteId);}catch(e){alert(e.message);}finally{setDeleteId(null);}}} onCancel={()=>setDeleteId(null)}/>}

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-boxes-stacked" style={{color:'var(--accent-blue)',marginRight:8}}></i>{editing?'Edit Resource':'Add Resource'}</h3>
              <button className="modal-close" onClick={()=>setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label>Resource Name</label><input className="form-control" placeholder="e.g. Life Jackets" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div className="form-group"><label>Category</label>
                <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {RESOURCE_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Status</label>
                <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option>Available</option><option>Partially Deployed</option><option>Deployed</option><option>In Use</option>
                </select>
              </div>
              <div className="form-group"><label>Total Quantity</label><input className="form-control" type="number" min={0} value={form.quantity} onChange={e=>setForm({...form,quantity:parseInt(e.target.value)||0})}/></div>
              <div className="form-group"><label>Available</label><input className="form-control" type="number" min={0} value={form.available} onChange={e=>setForm({...form,available:parseInt(e.target.value)||0})}/></div>
              <div className="form-group full"><label>Storage Location</label><input className="form-control" placeholder="e.g. Barangay Hall Storage Room" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
            </div>
            <div style={{marginTop:16,display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?<><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>:<><i className="fa-solid fa-floppy-disk"></i>{editing?'Save Changes':'Add Resource'}</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REPORTS  — with designed PDF export
══════════════════════════════════════════════════════════════ */
export function ReportsPage() {
  const { incidents, alerts, evacCenters, residents, resources, actLog } = useApp();
  const [exporting, setExporting] = useState('');

  const handleExport = async (type) => {
    setExporting(type);
    try {
      if (type === 'full')      exportFullReport({ incidents, alerts, evacCenters, residents, resources, actLog });
      if (type === 'incidents') exportIncidentsReport(incidents);
      if (type === 'residents') exportResidentsReport(residents);
    } catch(e) { alert('Export failed: ' + e.message); }
    finally { setTimeout(() => setExporting(''), 800); }
  };

  const typeColors = { Flood:'#4cc9f0', Fire:'#e63946', Landslide:'#f4a261', Storm:'#f9c74f', Earthquake:'#b39ddb' };
  const types      = ['Flood','Fire','Landslide','Storm','Earthquake'];
  const byType     = types.map(t => ({ type:t, count: incidents.filter(i=>i.type===t).length }));
  const maxType    = Math.max(...byType.map(i=>i.count), 1);

  const monthCounts = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb'].map(m => ({
    month: m,
    count: incidents.filter(i => i.dateReported && new Date(i.dateReported).toLocaleString('en',{month:'short'})===m).length,
  }));
  const maxMonth = Math.max(...monthCounts.map(m=>m.count), 1);

  const totalCap = evacCenters.reduce((a,c)=>a+c.capacity,0);
  const totalOcc = evacCenters.reduce((a,c)=>a+c.occupancy,0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reports &amp; Analytics</div>
          <div className="page-subtitle">Generate official PDF reports and view live statistics</div>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-secondary" onClick={()=>handleExport('incidents')} disabled={exporting==='incidents'}>
            {exporting==='incidents'?<><i className="fa-solid fa-spinner fa-spin"></i> Exporting...</>:<><i className="fa-solid fa-file-pdf" style={{color:'var(--accent-orange)'}}></i> Incidents PDF</>}
          </button>
          <button className="btn btn-secondary" onClick={()=>handleExport('residents')} disabled={exporting==='residents'}>
            {exporting==='residents'?<><i className="fa-solid fa-spinner fa-spin"></i> Exporting...</>:<><i className="fa-solid fa-file-pdf" style={{color:'var(--accent-purple)'}}></i> Residents PDF</>}
          </button>
          <button className="btn btn-primary" onClick={()=>handleExport('full')} disabled={exporting==='full'}>
            {exporting==='full'?<><i className="fa-solid fa-spinner fa-spin"></i> Generating...</>:<><i className="fa-solid fa-file-pdf"></i> Full Report PDF</>}
          </button>
        </div>
      </div>

      {/* PDF Preview Card */}
      <div className="card" style={{marginBottom:20,background:'linear-gradient(135deg,rgba(230,57,70,0.06),rgba(76,201,240,0.04))',borderColor:'rgba(76,201,240,0.2)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{width:48,height:48,background:'rgba(230,57,70,0.12)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,color:'var(--accent-red)',flexShrink:0}}>
            <i className="fa-solid fa-file-pdf"></i>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Official BDRRMC Disaster Management Report</div>
            <div style={{color:'var(--text-secondary)',fontSize:13}}>Dark-themed, branded PDF with executive summary, charts, all data tables, zone assessment, and activity log. Includes IDRMS header, color-coded status badges, and page numbers.</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
            <span className="badge badge-success"><i className="fa-solid fa-circle-check"></i> 7 Sections</span>
            <span className="badge badge-info"><i className="fa-solid fa-table"></i> All Tables Included</span>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
          {['Executive Summary','Incident Report','Alert History','Evacuation Centers','Resident Database','Resource Inventory','Activity Log'].map(s=>(
            <span key={s} style={{fontSize:11,color:'var(--text-secondary)',background:'var(--bg-deep)',padding:'3px 10px',borderRadius:20,border:'1px solid var(--border)'}}>{s}</span>
          ))}
        </div>
      </div>

      {/* Live Stats Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[
          { label:'Total Incidents',   value:incidents.length,                                             color:'var(--accent-orange)' },
          { label:'Active/Pending',    value:incidents.filter(i=>['Active','Pending'].includes(i.status)).length, color:'var(--accent-red)' },
          { label:'Resolved',          value:incidents.filter(i=>i.status==='Resolved').length,            color:'var(--accent-green)' },
          { label:'Active Alerts',     value:alerts.filter(a=>a.level!=='Resolved').length,                color:'var(--accent-red)' },
          { label:'Evacuees',          value:totalOcc,                                                     color:'var(--accent-blue)' },
          { label:'Total Residents',   value:residents.length,                                             color:'var(--accent-purple)' },
        ].map(s=>(
          <div key={s.label} className="card" style={{textAlign:'center',padding:16}}>
            <div style={{fontSize:26,fontFamily:'var(--font-display)',fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{color:'var(--text-secondary)',fontSize:11,marginTop:4,textTransform:'uppercase',letterSpacing:.5}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Incidents by Type */}
        <div className="card">
          <div className="section-title"><i className="fa-solid fa-chart-pie"></i>Incidents by Type</div>
          {byType.map(item=>(
            <div key={item.type} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                <span style={{color:'var(--text-secondary)',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:typeColors[item.type],display:'inline-block'}}></span>
                  {item.type}
                </span>
                <strong style={{color:typeColors[item.type]}}>{item.count}</strong>
              </div>
              <div className="res-bar-wrap" style={{height:8}}>
                <div className="res-bar" style={{width:`${(item.count/maxType)*100}%`,background:typeColors[item.type]}}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <div className="section-title"><i className="fa-solid fa-chart-line"></i>Monthly Incident Trend</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:120}}>
            {monthCounts.map(item=>(
              <div key={item.month} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%'}}>
                <div style={{flex:1,width:'100%',display:'flex',alignItems:'flex-end',background:'var(--bg-deep)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:'100%',height:item.count===0?'2%':`${(item.count/maxMonth)*100}%`,background:'linear-gradient(180deg,var(--accent-blue),rgba(76,201,240,0.3))',borderRadius:4,transition:'height .6s ease'}}></div>
                </div>
                <span style={{fontSize:10,color:'var(--text-muted)'}}>{item.month}</span>
                <span style={{fontSize:10,fontWeight:700,color:'var(--accent-blue)'}}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Risk Table */}
      <div className="card" style={{marginBottom:20,padding:0}}>
        <div style={{padding:'16px 20px 0'}}><div className="section-title"><i className="fa-solid fa-map-pin"></i>Zone Risk Assessment</div></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Zone</th><th>Risk Level</th><th>Main Hazard</th><th>Incidents</th><th>Recommendation</th></tr></thead>
            <tbody>
              {[
                {zone:'Zone 1',risk:'Medium',hazard:'Fire',       rec:'Pre-position fire suppression equipment. Monitor closely.'},
                {zone:'Zone 2',risk:'Low',   hazard:'Flood',      rec:'Continue standard monitoring protocols.'},
                {zone:'Zone 3',risk:'High',  hazard:'Flood',      rec:'Pre-position rescue team. Evacuation orders on standby.'},
                {zone:'Zone 4',risk:'Low',   hazard:'Earthquake', rec:'Structural inspection advisory after seismic events.'},
                {zone:'Zone 5',risk:'High',  hazard:'Landslide',  rec:'Block hillside access roads. Prepare mandatory evacuation.'},
                {zone:'Zone 6',risk:'Medium',hazard:'Storm',      rec:'Coastal flood monitoring. Pre-position relief goods.'},
              ].map(z=>(
                <tr key={z.zone}>
                  <td><strong>{z.zone}</strong></td>
                  <td><span className={`badge badge-${z.risk==='High'?'danger':z.risk==='Medium'?'warning':'success'}`}>{z.risk}</span></td>
                  <td style={{color:'var(--text-secondary)'}}>{z.hazard}</td>
                  <td style={{textAlign:'center',fontWeight:700}}>{incidents.filter(i=>i.zone===z.zone).length}</td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{z.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* Resident Status */}
        <div className="card">
          <div className="section-title"><i className="fa-solid fa-users"></i>Resident Status Summary</div>
          {[['Safe','var(--accent-green)'],['Evacuated','var(--accent-blue)'],['Unaccounted','var(--accent-red)']].map(([s,c])=>(
            <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{color:'var(--text-secondary)'}}>{s}</span>
              <strong style={{color:c,fontSize:18,fontFamily:'var(--font-display)'}}>{residents.filter(r=>r.evacuationStatus===s).length}</strong>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0'}}>
            <span style={{color:'var(--text-secondary)'}}>Total Registered</span>
            <strong style={{fontSize:18,fontFamily:'var(--font-display)'}}>{residents.length}</strong>
          </div>
        </div>

        {/* Evac Capacity */}
        <div className="card">
          <div className="section-title"><i className="fa-solid fa-house-flag"></i>Evacuation Capacity</div>
          {evacCenters.map(c=>{
            const pct = c.capacity > 0 ? Math.round((c.occupancy/c.capacity)*100) : 0;
            return(
              <div key={c.id} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                  <span style={{color:'var(--text-secondary)'}}>{c.name}</span>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:11,color:'var(--text-muted)'}}>{c.occupancy}/{c.capacity}</span>
                    <span className={`badge badge-${c.status==='Open'?'success':c.status==='Full'?'danger':'neutral'}`} style={{padding:'2px 7px',fontSize:10}}>{c.status}</span>
                  </div>
                </div>
                <div className="cap-bar-wrap"><div className={`cap-bar ${c.status.toLowerCase()}`} style={{width:`${Math.min(pct,100)}%`}}></div></div>
              </div>
            );
          })}
          {evacCenters.length===0&&<p style={{color:'var(--text-muted)',fontSize:13}}>No evacuation centers registered.</p>}
          {evacCenters.length>0&&<div style={{display:'flex',justifyContent:'space-between',marginTop:12,paddingTop:10,borderTop:'1px solid var(--border)',fontSize:13}}><span style={{color:'var(--text-secondary)'}}>Total Capacity Used</span><strong>{totalCap>0?Math.round((totalOcc/totalCap)*100):0}% ({totalOcc}/{totalCap})</strong></div>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RISK INTELLIGENCE
══════════════════════════════════════════════════════════════ */
export function IntelligencePage() {
  const { incidents } = useApp();
  const [showInsights, setShowInsights] = useState(false);

  const activeCount = incidents.filter(i=>i.status==='Active').length;
  const highZones   = [
    {zone:'Zone 3',hazard:'Flood',     level:'High',   result:'CRITICAL'},
    {zone:'Zone 5',hazard:'Landslide', level:'High',   result:'CRITICAL'},
    {zone:'Zone 1',hazard:'Fire',      level:'Medium', result:'ELEVATED'},
    {zone:'Zone 6',hazard:'Storm',     level:'Medium', result:'ELEVATED'},
    {zone:'Zone 2',hazard:'Flood',     level:'Low',    result:'NORMAL'},
    {zone:'Zone 4',hazard:'Earthquake',level:'Low',    result:'NORMAL'},
  ];
  const riskScore = Math.min(Math.round((activeCount / Math.max(incidents.length,1))*100 + highZones.filter(z=>z.level==='High').length*10), 99);
  const levelColor = { High:'var(--accent-red)', Medium:'var(--accent-orange)', Low:'var(--accent-green)' };
  const levelBadge = { High:'badge-danger', Medium:'badge-warning', Low:'badge-success' };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Risk Intelligence</div><div className="page-subtitle">AI-assisted hazard prediction and zone risk assessment engine</div></div>
        <button className={`btn ${showInsights?'btn-success':'btn-primary'}`} onClick={()=>setShowInsights(!showInsights)}>
          <i className={`fa-solid ${showInsights?'fa-eye-slash':'fa-wand-magic-sparkles'}`}></i>{showInsights?'Hide Insights':'Run AI Analysis'}
        </button>
      </div>

      <div className="card" style={{marginBottom:20,borderColor:'rgba(244,162,97,.3)',background:'rgba(244,162,97,.04)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{flex:1}}>
            <div className="section-title" style={{marginBottom:4}}><i className="fa-solid fa-brain"></i>BDRRMC Risk Assessment Engine</div>
            <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:4}}>Based on {incidents.length} incident records, PAGASA weather data, and historical zone analysis. Barangay Kauswagan, CDO.</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>Overall Risk Score</div>
            <div style={{fontSize:36,fontFamily:'var(--font-display)',fontWeight:800,color:riskScore>70?'var(--accent-red)':riskScore>40?'var(--accent-orange)':'var(--accent-green)'}}>{riskScore}<span style={{fontSize:18}}>%</span></div>
          </div>
        </div>
      </div>

      <div className="section-title"><i className="fa-solid fa-chart-column"></i>Zone Predictions</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
        {highZones.map(z=>(
          <div key={z.zone} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:16,display:'flex',alignItems:'center',gap:14,transition:'border-color .2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-accent)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
          >
            <div style={{width:48,height:48,borderRadius:10,background:`rgba(${z.level==='High'?'230,57,70':z.level==='Medium'?'244,162,97':'6,214,160'},.12)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:levelColor[z.level],flexShrink:0}}>
              <i className={`fa-solid ${z.hazard==='Flood'?'fa-water':z.hazard==='Fire'?'fa-fire':z.hazard==='Landslide'?'fa-hill-rockslide':z.hazard==='Storm'?'fa-cloud-bolt':'fa-circle-exclamation'}`}></i>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <strong style={{fontSize:14}}>{z.zone} — {z.hazard} Risk</strong>
                <span className={`badge ${levelBadge[z.level]}`}>{z.level}</span>
              </div>
              <div style={{fontSize:22,fontFamily:'var(--font-display)',fontWeight:800,color:levelColor[z.level]}}>{z.result}</div>
            </div>
            <div style={{textAlign:'right',fontSize:12,color:'var(--text-muted)'}}>
              {incidents.filter(i=>i.zone===z.zone).length} incident{incidents.filter(i=>i.zone===z.zone).length!==1?'s':''}
            </div>
          </div>
        ))}
      </div>

      {showInsights && (
        <div className="card" style={{borderColor:'rgba(76,201,240,.3)',background:'rgba(76,201,240,.04)',animation:'fadeInUp .25s ease'}}>
          <div className="section-title"><i className="fa-solid fa-wand-magic-sparkles"></i>Automatic Alert Suggestions</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              {zone:'Zone 3',msg:'Evacuate low-lying residents near Cagayan River. Issue DANGER flood alert.',urgent:true},
              {zone:'Zone 5',msg:'Block hillside access road. Warn residents of landslide risk immediately.',urgent:true},
              {zone:'Zone 1',msg:'Pre-position fire trucks in Zone 1 residential areas.',urgent:false},
              {zone:'All Zones',msg:'Issue general heavy rainfall advisory valid for next 24 hours.',urgent:false},
            ].map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:8,background:'var(--bg-deep)',border:`1px solid ${s.urgent?'rgba(230,57,70,.3)':'var(--border)'}`}}>
                <i className={`fa-solid ${s.urgent?'fa-triangle-exclamation':'fa-circle-info'}`} style={{color:s.urgent?'var(--accent-red)':'var(--accent-blue)',fontSize:16,flexShrink:0}}></i>
                <div style={{flex:1}}><strong>{s.zone}</strong> <span style={{color:'var(--text-secondary)',fontSize:13}}>— {s.msg}</span></div>
                <button className={`btn btn-sm ${s.urgent?'btn-primary':'btn-secondary'}`}><i className="fa-solid fa-bullhorn"></i> Send</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   USER MANAGEMENT
══════════════════════════════════════════════════════════════ */
export function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ name:'', role:'Staff', email:'', status:'Active', password:'' });

  const roleBadge   = { Admin:'danger', Staff:'info' };
  const statusBadge = { Active:'success', Inactive:'neutral' };

  const openAdd  = () => { setEditing(null); setForm({ name:'', role:'Staff', email:'', status:'Active', password:'' }); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({...u, password:''}); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      if (editing) await updateUser(editing.id, form);
      else         await addUser({ ...form, lastLogin: new Date().toISOString() });
      setShowModal(false);
    } catch(e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (id, cur) => {
    try { await updateUser(id, { status: cur==='Active'?'Inactive':'Active' }); }
    catch(e) { alert(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">User Management</div><div className="page-subtitle">Manage system accounts with role-based access control — linked to Supabase Auth</div></div>
        <button className="btn btn-primary" onClick={openAdd}><i className="fa-solid fa-user-plus"></i> Add User</button>
      </div>
      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,background:'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#fff',fontSize:13,flexShrink:0}}>{(u.name||'U').charAt(0)}</div>
                      <div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'monospace'}}>{u.id?.slice(0,12)}</div></div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${roleBadge[u.role]||'neutral'}`}>{u.role}</span></td>
                  <td style={{fontSize:12,color:'var(--text-secondary)'}}>{u.email}</td>
                  <td><span className={`badge badge-${statusBadge[u.status]}`}>{u.status}</span></td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{u.lastLogin?new Date(u.lastLogin).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>openEdit(u)}><i className="fa-solid fa-pen"></i></button>
                      <button className={`btn btn-sm ${u.status==='Active'?'btn-outline':'btn-success'}`} onClick={()=>toggleStatus(u.id,u.status)} title={u.status==='Active'?'Deactivate':'Activate'}>
                        <i className={`fa-solid ${u.status==='Active'?'fa-ban':'fa-circle-check'}`}></i>
                      </button>
                      <button className="btn btn-sm" style={{background:'rgba(230,57,70,.12)',color:'var(--accent-red)',border:'1px solid rgba(230,57,70,.25)'}} onClick={()=>setDeleteId(u.id)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length===0&&<tr><td colSpan={6}><div className="empty-state"><i className="fa-solid fa-users-slash"></i><p>No users found.</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && <ConfirmModal title="Delete User" message="Remove this user account? This cannot be undone." onConfirm={async()=>{try{await deleteUser(deleteId);}catch(e){alert(e.message);}finally{setDeleteId(null);}}} onCancel={()=>setDeleteId(null)}/>}

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-user-shield" style={{color:'var(--accent-blue)',marginRight:8}}></i>{editing?'Edit User':'Add User'}</h3>
              <button className="modal-close" onClick={()=>setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label>Full Name</label><input className="form-control" placeholder="Full name..." value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div className="form-group"><label>Role</label><select className="form-control" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>Admin</option><option>Staff</option></select></div>
              <div className="form-group"><label>Status</label><select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Inactive</option></select></div>
              <div className="form-group full"><label>Email Address</label><input className="form-control" type="email" placeholder="user@kauswagan.gov.ph" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="form-group full"><label>Password <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:11}}>{editing?'(leave blank to keep current)':'(create in Supabase Auth)'}</span></label>
                <input className="form-control" type="password" placeholder="Password..." value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
              </div>
            </div>
            <div style={{marginTop:16,display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?<><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>:<><i className="fa-solid fa-floppy-disk"></i>{editing?'Save Changes':'Add User'}</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACTIVITY LOG
══════════════════════════════════════════════════════════════ */
export function ActivityPage() {
  const { actLog } = useApp();
  const typeBadge = { Alert:'danger', Incident:'warning', Evacuation:'success', Resource:'info', Resident:'purple' };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Activity Log</div><div className="page-subtitle">Complete audit trail synced to Supabase — all system actions recorded in real-time</div></div>
        <button className="btn btn-secondary" onClick={()=>window.print()}><i className="fa-solid fa-download"></i> Export Log</button>
      </div>
      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead><tr><th>Log ID</th><th>Action</th><th>Type</th><th>User</th><th>Timestamp</th></tr></thead>
            <tbody>
              {actLog.map((log,i)=>(
                <tr key={log.id||i}>
                  <td><span className="mono">{(log.id||'—').slice(0,8)}</span></td>
                  <td>{log.action}</td>
                  <td><span className={`badge badge-${typeBadge[log.type]||'neutral'}`}>{log.type}</span></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:24,height:24,background:'var(--bg-card-hover)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--accent-blue)',flexShrink:0}}>{(log.user||'S').charAt(0).toUpperCase()}</div>
                      {log.user}
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{log.time?new Date(log.time).toLocaleString('en-PH',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</td>
                </tr>
              ))}
              {actLog.length===0&&<tr><td colSpan={5}><div className="empty-state"><i className="fa-solid fa-clock"></i><p>No activity recorded yet. Actions will appear here in real-time.</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
