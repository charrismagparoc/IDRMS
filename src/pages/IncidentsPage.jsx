import { useState } from 'react';
import '../styles/Pages.css';
import { ZONES, INCIDENT_TYPES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';

const typeIcon = { Flood:'fa-water', Fire:'fa-fire', Landslide:'fa-hill-rockslide', Storm:'fa-cloud-bolt', Earthquake:'fa-circle-exclamation' };
const statusColor = { Active:'danger', Pending:'warning', Verified:'info', Responded:'purple', Resolved:'success' };
const severityColor = { High:'danger', Medium:'warning', Low:'info' };
const statuses = ['All','Active','Pending','Verified','Responded','Resolved'];
const emptyForm = { type:'Flood', zone:'Zone 1', location:'', severity:'Medium', reporter:'', description:'' };

export default function IncidentsPage() {
  const { incidents, addIncident, updateIncident, deleteIncident } = useApp();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType,   setFilterType]   = useState('All');
  const [search,       setSearch]       = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [form,         setForm]         = useState(emptyForm);
  const [deleteId,     setDeleteId]     = useState(null);
  const [saving,       setSaving]       = useState(false);

  const filtered = incidents.filter(i => {
    const ms = filterStatus === 'All' || i.status === filterStatus;
    const mt = filterType   === 'All' || i.type   === filterType;
    const mq = (i.location||'').toLowerCase().includes(search.toLowerCase())
            || (i.zone||'').toLowerCase().includes(search.toLowerCase())
            || (i.reporter||'').toLowerCase().includes(search.toLowerCase());
    return ms && mt && mq;
  });

  const openNew  = () => { setIsEditing(false); setSelected(null); setForm(emptyForm); setShowModal(true); };
  const openView = (inc) => { setIsEditing(false); setSelected(inc); setForm({...inc}); setShowModal(true); };
  const openEdit = (inc) => { setIsEditing(true);  setSelected(inc); setForm({...inc}); setShowModal(true); };

  const handleSave = async () => {
    if (!form.location?.trim() || !form.reporter?.trim()) return;
    setSaving(true);
    try {
      if (isEditing && selected) await updateIncident(selected.id, form);
      else                       await addIncident(form);
      setShowModal(false);
    } catch(e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, s) => {
    try {
      await updateIncident(id, { status: s });
      setSelected(p => p ? {...p, status: s} : p);
    } catch(e) { alert(e.message); }
  };

  const handleDelete = async () => {
    try { await deleteIncident(deleteId); }
    catch(e) { alert(e.message); }
    finally { setDeleteId(null); setShowModal(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Incident Management</div><div className="page-subtitle">Track, verify, and respond to reported incidents — live sync with Supabase</div></div>
        <button className="btn btn-primary" onClick={openNew}><i className="fa-solid fa-plus"></i> Report Incident</button>
      </div>

      <div className="summary-pills">
        {statuses.slice(1).map(s => (
          <div key={s} className={`summary-pill badge badge-${statusColor[s]}`} style={{cursor:'pointer',userSelect:'none'}} onClick={()=>setFilterStatus(filterStatus===s?'All':s)}>
            {incidents.filter(i=>i.status===s).length} {s}
          </div>
        ))}
      </div>

      <div className="filter-row">
        <input className="form-control" placeholder="Search location, zone, reporter..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:280}}/>
        <select className="form-control" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{maxWidth:160}}>
          {statuses.map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="form-control" value={filterType} onChange={e=>setFilterType(e.target.value)} style={{maxWidth:160}}>
          <option>All</option>{INCIDENT_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
        <span style={{marginLeft:'auto',fontSize:12,color:'var(--text-muted)'}}>{filtered.length} record{filtered.length!==1?'s':''}</span>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-container">
          <table>
            <thead><tr><th>ID</th><th>Type</th><th>Zone / Location</th><th>Reporter</th><th>Severity</th><th>Status</th><th>Reported</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.id}>
                  <td><span className="mono" style={{fontSize:11}}>{(inc.id||'').slice(0,8)}</span></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <div style={{width:30,height:30,borderRadius:7,background:'var(--bg-deep)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <i className={`fa-solid ${typeIcon[inc.type]||'fa-circle'}`} style={{fontSize:13,color:'var(--accent-blue)'}}></i>
                      </div>
                      {inc.type}
                    </div>
                  </td>
                  <td><div style={{fontWeight:600}}>{inc.zone}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{inc.location}</div></td>
                  <td>{inc.reporter}</td>
                  <td><span className={`badge badge-${severityColor[inc.severity]}`}>{inc.severity}</span></td>
                  <td><span className={`badge badge-${statusColor[inc.status]}`}>{inc.status}</span></td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{inc.dateReported?new Date(inc.dateReported).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</td>
                  <td>
                    <div style={{display:'flex',gap:5}}>
                      <button className="btn btn-secondary btn-sm" onClick={()=>openView(inc)} title="View"><i className="fa-solid fa-eye"></i></button>
                      <button className="btn btn-outline btn-sm"   onClick={()=>openEdit(inc)} title="Edit"><i className="fa-solid fa-pen"></i></button>
                      {inc.status!=='Resolved' && <button className="btn btn-success btn-sm" onClick={()=>updateStatus(inc.id,'Resolved')} title="Resolve"><i className="fa-solid fa-check"></i></button>}
                      <button className="btn btn-sm" style={{background:'rgba(230,57,70,.12)',color:'var(--accent-red)',border:'1px solid rgba(230,57,70,.3)'}} onClick={()=>setDeleteId(inc.id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={8}><div className="empty-state"><i className="fa-solid fa-inbox"></i><p>No incidents match your filters.</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && <ConfirmModal title="Delete Incident" message="Delete this incident record? This cannot be undone." onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>}

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-triangle-exclamation" style={{color:'var(--accent-orange)',marginRight:8}}></i>
                {isEditing ? `Edit Incident` : selected ? `Incident ${(selected.id||'').slice(0,8)}` : 'Report New Incident'}
              </h3>
              <button className="modal-close" onClick={()=>setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>

            {selected && !isEditing ? (
              <div>
                <div className="detail-grid">
                  <div className="detail-item"><span>Type</span><strong>{selected.type}</strong></div>
                  <div className="detail-item"><span>Zone</span><strong>{selected.zone}</strong></div>
                  <div className="detail-item"><span>Severity</span><span className={`badge badge-${severityColor[selected.severity]}`}>{selected.severity}</span></div>
                  <div className="detail-item"><span>Status</span><span className={`badge badge-${statusColor[selected.status]}`}>{selected.status}</span></div>
                  <div className="detail-item full"><span>Location</span><strong>{selected.location}</strong></div>
                  <div className="detail-item full"><span>Reporter</span><strong>{selected.reporter}</strong></div>
                  {selected.description && <div className="detail-item full"><span>Description</span><p style={{color:'var(--text-primary)',fontSize:13,marginTop:4,lineHeight:1.6}}>{selected.description}</p></div>}
                </div>
                <div className="divider"></div>
                <div className="section-title"><i className="fa-solid fa-arrow-right-arrow-left"></i>Update Status</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
                  {['Pending','Verified','Responded','Resolved'].map(s => (
                    <button key={s} className={`btn btn-sm ${selected.status===s?'btn-primary':'btn-secondary'}`} onClick={()=>updateStatus(selected.id,s)}>{s}</button>
                  ))}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-outline btn-sm" onClick={()=>openEdit(selected)}><i className="fa-solid fa-pen"></i> Edit</button>
                  <button className="btn btn-sm" style={{background:'rgba(230,57,70,.12)',color:'var(--accent-red)',border:'1px solid rgba(230,57,70,.3)'}} onClick={()=>setDeleteId(selected.id)}><i className="fa-solid fa-trash"></i> Delete</button>
                </div>
              </div>
            ) : (
              <div className="form-grid">
                <div className="form-group"><label>Type</label><select className="form-control" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{INCIDENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label>Zone</label><select className="form-control" value={form.zone} onChange={e=>setForm({...form,zone:e.target.value})}>{ZONES.map(z=><option key={z}>{z}</option>)}</select></div>
                <div className="form-group full"><label>Specific Location</label><input className="form-control" placeholder="e.g. Purok 4, near Cagayan River..." value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
                <div className="form-group"><label>Severity</label><select className="form-control" value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></div>
                <div className="form-group"><label>Reported By</label><input className="form-control" placeholder="Full name of reporter..." value={form.reporter} onChange={e=>setForm({...form,reporter:e.target.value})}/></div>
                <div className="form-group full"><label>Description</label><textarea className="form-control" rows={3} placeholder="Describe the situation in detail..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea></div>
                <div className="form-group full" style={{flexDirection:'row',justifyContent:'flex-end',gap:8}}>
                  <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving?<><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>:<><i className="fa-solid fa-paper-plane"></i>{isEditing?'Save Changes':'Submit Report'}</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
