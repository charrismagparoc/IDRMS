import { useState } from 'react';
import AlertBanner from '../components/AlertBanner';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Pages.css';
import { useApp } from '../context/AppContext';

const ZONES = ['All Zones','Zone 1','Zone 2','Zone 3','Zone 4','Zone 5','Zone 6'];
const quickAlerts = [
  { label:'Flood Warning',    zone:'Zone 3',   level:'Danger',   icon:'fa-water',                         msg:'FLOOD WARNING: Water level critically high in Zone 3. Immediate evacuation of low-lying areas required.' },
  { label:'Evacuation Order', zone:'All Zones', level:'Danger',   icon:'fa-person-walking-arrow-right',    msg:'MANDATORY EVACUATION ORDER: All residents in high-risk zones must proceed to nearest evacuation center immediately.' },
  { label:'All Clear',        zone:'All Zones', level:'Resolved', icon:'fa-circle-check',                  msg:'ALL CLEAR: The threat has passed. Residents may return to their homes. Exercise caution with debris and damaged structures.' },
  { label:'Storm Advisory',   zone:'All Zones', level:'Advisory', icon:'fa-cloud-bolt',                    msg:'STORM ADVISORY: Prepare emergency kits. Strong winds and heavy rain expected within the next 12 hours.' },
];

export default function AlertsPage() {
  const { alerts, addAlert, deleteAlert } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ level:'Advisory', zone:'All Zones', message:'', channel:'Web' });
  const [sent,      setSent]      = useState(false);
  const [sending,   setSending]   = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);

  const handleSend = async () => {
    if (!form.message.trim()) return;
    setSending(true);
    try {
      await addAlert(form);
      setSent(true);
      setTimeout(() => { setShowModal(false); setSent(false); setForm({ level:'Advisory', zone:'All Zones', message:'', channel:'Web' }); }, 1800);
    } catch(e) { alert('Failed to send alert: ' + e.message); }
    finally { setSending(false); }
  };

  const openQuick = (q) => { setForm({ level:q.level, zone:q.zone, message:q.msg, channel:'Web + SMS' }); setShowModal(true); };

  const handleDelete = async () => {
    try { await deleteAlert(deleteId); }
    catch(e) { alert(e.message); }
    finally { setDeleteId(null); }
  };

  const levelCount = (lvl) => alerts.filter(a=>a.level===lvl).length;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Alert System</div><div className="page-subtitle">Broadcast emergency alerts across all barangay zones — saved to Supabase in real-time</div></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><i className="fa-solid fa-bullhorn"></i> Send Alert</button>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[['Total Sent',alerts.length,'var(--accent-blue)'],['Danger',levelCount('Danger'),'var(--accent-red)'],['Warning',levelCount('Warning'),'var(--accent-orange)'],['Advisory',levelCount('Advisory'),'var(--accent-blue)']].map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:24,fontFamily:'var(--font-display)',fontWeight:800,color:c}}>{v}</div>
            <div style={{color:'var(--text-secondary)',fontSize:11,marginTop:2,textTransform:'uppercase',letterSpacing:.5}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Quick Broadcast */}
      <div className="card" style={{marginBottom:20}}>
        <div className="section-title"><i className="fa-solid fa-bolt"></i>Quick Emergency Broadcast</div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {quickAlerts.map(q => (
            <button key={q.label} className="btn btn-secondary" onClick={()=>openQuick(q)}>
              <i className={`fa-solid ${q.icon}`}></i>{q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert History */}
      <div className="section-title"><i className="fa-solid fa-clock-rotate-left"></i>Alert History ({alerts.length})</div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {alerts.length === 0 && <div className="empty-state"><i className="fa-solid fa-bell-slash"></i><p>No alerts sent yet. Use the button above to broadcast an alert.</p></div>}
        {alerts.map(alert => (
          <div key={alert.id} style={{position:'relative'}}>
            <AlertBanner level={alert.level} message={alert.message} zone={alert.zone} time={alert.sentAt} sentBy={alert.sentBy}/>
            <button
              style={{position:'absolute',top:10,right:10,background:'rgba(230,57,70,.12)',color:'var(--accent-red)',border:'1px solid rgba(230,57,70,.25)',borderRadius:6,padding:'5px 10px',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}
              onClick={()=>setDeleteId(alert.id)}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        ))}
      </div>

      {deleteId && <ConfirmModal title="Delete Alert" message="Remove this alert from history?" onConfirm={handleDelete} onCancel={()=>setDeleteId(null)}/>}

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-bullhorn" style={{color:'var(--accent-red)',marginRight:8}}></i>Send Emergency Alert</h3>
              <button className="modal-close" onClick={()=>setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            {sent ? (
              <div style={{textAlign:'center',padding:'32px 0'}}>
                <i className="fa-solid fa-circle-check" style={{fontSize:56,color:'var(--accent-green)',display:'block',marginBottom:14}}></i>
                <h3 style={{marginBottom:6}}>Alert Sent Successfully!</h3>
                <p style={{color:'var(--text-secondary)',fontSize:13}}>Broadcast to <strong>{form.zone}</strong> via <strong>{form.channel}</strong>.</p>
              </div>
            ) : (
              <div className="form-grid">
                <div className="form-group"><label>Alert Level</label>
                  <select className="form-control" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
                    <option>Advisory</option><option>Warning</option><option>Danger</option><option>Resolved</option>
                  </select>
                </div>
                <div className="form-group"><label>Target Zone</label>
                  <select className="form-control" value={form.zone} onChange={e=>setForm({...form,zone:e.target.value})}>
                    {ZONES.map(z=><option key={z}>{z}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Broadcast Channel</label>
                  <select className="form-control" value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})}>
                    <option>Web</option><option>Web + SMS</option><option>SMS Only</option>
                  </select>
                </div>
                <div className="form-group" style={{gridColumn:'span 1'}}></div>
                <div className="form-group full"><label>Alert Message</label>
                  <textarea className="form-control" rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="e.g. FLOOD WARNING: Water level critically high in Zone 3. Evacuate immediately."></textarea>
                </div>
                <div className="form-group full" style={{flexDirection:'row',justifyContent:'flex-end',gap:8}}>
                  <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
                    {sending?<><i className="fa-solid fa-spinner fa-spin"></i> Sending...</>:<><i className="fa-solid fa-paper-plane"></i>Send Alert</>}
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
