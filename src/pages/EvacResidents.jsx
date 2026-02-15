import { useState } from 'react';
import '../styles/Pages.css';
import { ZONES, EVAC_FACILITIES, VULNERABILITY_TAGS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';

/* ══════════════════════════════════════════════════════════════
   EVACUATION CENTERS
══════════════════════════════════════════════════════════════ */
export function EvacuationPage() {
  const { evacCenters, addEvacCenter, updateEvacCenter, deleteEvacCenter } = useApp();
  const [selected,  setSelected]  = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', zone: 'Zone 1', status: 'Open',
    capacity: 100, occupancy: 0, contactPerson: '', contact: '', facilitiesAvailable: []
  });

  const statusBadge = { Open: 'success', Full: 'danger', Closed: 'neutral' };
  const totalCap = evacCenters.reduce((a, c) => a + c.capacity, 0);
  const totalOcc = evacCenters.reduce((a, c) => a + c.occupancy, 0);

  const openAdd = () => {
    setIsEditing(false);
    setForm({ name:'', address:'', zone:'Zone 1', status:'Open', capacity:100, occupancy:0, contactPerson:'', contact:'', facilitiesAvailable:[] });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setIsEditing(true);
    setForm({ ...c });
    setSelected(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (isEditing && form.id) await updateEvacCenter(form.id, form);
      else                      await addEvacCenter(form);
      setShowModal(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvacCenter(deleteId);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleteId(null);
    }
  };

  const updateStatus = async (id, s) => {
    try {
      await updateEvacCenter(id, { status: s });
      setSelected(p => p ? { ...p, status: s } : p);
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleFacility = (f) =>
    setForm(p => ({
      ...p,
      facilitiesAvailable: p.facilitiesAvailable.includes(f)
        ? p.facilitiesAvailable.filter(x => x !== f)
        : [...p.facilitiesAvailable, f]
    }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Evacuation Centers</div>
          <div className="page-subtitle">Monitor capacity, occupancy, and status of all evacuation centers</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="fa-solid fa-plus"></i> Add Center</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:28, fontFamily:'var(--font-display)', fontWeight:800, color:'var(--accent-green)' }}>{evacCenters.filter(c => c.status === 'Open').length}</div>
          <div style={{ color:'var(--text-secondary)', fontSize:12 }}>Open Centers</div>
        </div>
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:28, fontFamily:'var(--font-display)', fontWeight:800, color:'var(--accent-blue)' }}>{totalOcc}</div>
          <div style={{ color:'var(--text-secondary)', fontSize:12 }}>Current Evacuees</div>
        </div>
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:28, fontFamily:'var(--font-display)', fontWeight:800, color:'var(--accent-orange)' }}>{totalCap - totalOcc}</div>
          <div style={{ color:'var(--text-secondary)', fontSize:12 }}>Remaining Capacity</div>
        </div>
      </div>

      {evacCenters.length === 0 && (
        <div className="empty-state"><i className="fa-solid fa-house-flag"></i><p>No evacuation centers yet. Add one above.</p></div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:16 }}>
        {evacCenters.map(c => {
          const pct = c.capacity > 0 ? (c.occupancy / c.capacity) * 100 : 0;
          return (
            <div key={c.id} className="card" style={{ cursor:'pointer', position:'relative' }} onClick={() => setSelected(c)}>
              <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)} title="Edit"><i className="fa-solid fa-pen"></i></button>
                <button className="btn btn-sm" style={{ background:'rgba(230,57,70,.12)', color:'var(--accent-red)', border:'1px solid rgba(230,57,70,.25)' }} onClick={() => setDeleteId(c.id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, paddingRight:80 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{c.address}</div>
                </div>
                <span className={`badge badge-${statusBadge[c.status]}`}>{c.status}</span>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-secondary)', marginBottom:4 }}>
                  <span>Occupancy</span><span>{c.occupancy} / {c.capacity}</span>
                </div>
                <div className="cap-bar-wrap">
                  <div className={`cap-bar ${c.status.toLowerCase()}`} style={{ width:`${Math.min(pct, 100)}%` }}></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(c.facilitiesAvailable || []).map(f => (
                  <span key={f} style={{ fontSize:11, color:'var(--text-muted)', background:'var(--bg-deep)', padding:'2px 8px', borderRadius:20, border:'1px solid var(--border)' }}>{f}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {deleteId && (
        <ConfirmModal
          title="Delete Center"
          message="Remove this evacuation center?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* View Modal */}
      {selected && !showModal && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-house-flag" style={{ color:'var(--accent-green)', marginRight:8 }}></i>{selected.name}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><span>Zone</span><strong>{selected.zone}</strong></div>
              <div className="detail-item"><span>Status</span><span className={`badge badge-${statusBadge[selected.status]}`}>{selected.status}</span></div>
              <div className="detail-item"><span>Capacity</span><strong>{selected.capacity}</strong></div>
              <div className="detail-item"><span>Occupancy</span><strong>{selected.occupancy}</strong></div>
              <div className="detail-item"><span>Contact Person</span><strong>{selected.contactPerson || '—'}</strong></div>
              <div className="detail-item"><span>Contact No.</span><strong>{selected.contact || '—'}</strong></div>
            </div>
            <div className="divider"></div>
            <div className="section-title"><i className="fa-solid fa-arrow-right-arrow-left"></i>Update Status</div>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {['Open', 'Full', 'Closed'].map(s => (
                <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateStatus(selected.id, s)}>{s}</button>
              ))}
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => openEdit(selected)}><i className="fa-solid fa-pen"></i> Edit Details</button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-house-flag" style={{ color:'var(--accent-green)', marginRight:8 }}></i>{isEditing ? 'Edit Center' : 'Add Evacuation Center'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label>Center Name</label><input className="form-control" placeholder="e.g. Kauswagan Covered Court" value={form.name} onChange={e => setForm({ ...form, name:e.target.value })}/></div>
              <div className="form-group full"><label>Address</label><input className="form-control" placeholder="Full address..." value={form.address} onChange={e => setForm({ ...form, address:e.target.value })}/></div>
              <div className="form-group">
                <label>Zone</label>
                <select className="form-control" value={form.zone} onChange={e => setForm({ ...form, zone:e.target.value })}>
                  {ZONES.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status:e.target.value })}>
                  <option>Open</option><option>Full</option><option>Closed</option>
                </select>
              </div>
              <div className="form-group"><label>Capacity</label><input className="form-control" type="number" min={0} value={form.capacity} onChange={e => setForm({ ...form, capacity:parseInt(e.target.value)||0 })}/></div>
              <div className="form-group"><label>Occupancy</label><input className="form-control" type="number" min={0} value={form.occupancy} onChange={e => setForm({ ...form, occupancy:parseInt(e.target.value)||0 })}/></div>
              <div className="form-group"><label>Contact Person</label><input className="form-control" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson:e.target.value })}/></div>
              <div className="form-group"><label>Contact Number</label><input className="form-control" placeholder="09XX-XXX-XXXX" value={form.contact} onChange={e => setForm({ ...form, contact:e.target.value })}/></div>
              <div className="form-group full">
                <label>Facilities Available</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                  {EVAC_FACILITIES.map(f => (
                    <button key={f} type="button"
                      className={`btn btn-sm ${form.facilitiesAvailable.includes(f) ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => toggleFacility(f)}>{f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop:16, display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                  : <><i className="fa-solid fa-floppy-disk"></i>{isEditing ? 'Save Changes' : 'Add Center'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RESIDENTS
══════════════════════════════════════════════════════════════ */
export function ResidentsPage() {
  const { residents, addResident, updateResident, deleteResident } = useApp();
  const [search,       setSearch]       = useState('');
  const [filterZone,   setFilterZone]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [form, setForm] = useState({
    name: '', zone: 'Zone 1', address: '', householdMembers: 1,
    contact: '', evacuationStatus: 'Safe', vulnerabilityTags: []
  });

  const statusBadge = { Safe:'success', Evacuated:'info', Unaccounted:'danger' };

  const filtered = residents.filter(r => {
    const mz = filterZone   === 'All' || r.zone            === filterZone;
    const ms = filterStatus === 'All' || r.evacuationStatus === filterStatus;
    const mq = (r.name    || '').toLowerCase().includes(search.toLowerCase())
            || (r.address || '').toLowerCase().includes(search.toLowerCase());
    return mz && ms && mq;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name:'', zone:'Zone 1', address:'', householdMembers:1, contact:'', evacuationStatus:'Safe', vulnerabilityTags:[] });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ ...r });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) await updateResident(editing.id, form);
      else         await addResident(form);
      setShowModal(false);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResident(deleteId);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleteId(null);
    }
  };

  const toggleTag = (t) =>
    setForm(p => ({
      ...p,
      vulnerabilityTags: p.vulnerabilityTags.includes(t)
        ? p.vulnerabilityTags.filter(x => x !== t)
        : [...p.vulnerabilityTags, t]
    }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Resident Management</div>
          <div className="page-subtitle">Resident database with vulnerability tagging and evacuation status tracking</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="fa-solid fa-user-plus"></i> Add Resident</button>
      </div>

      <div className="summary-pills">
        <div className="summary-pill badge badge-success">{residents.filter(r => r.evacuationStatus === 'Safe').length} Safe</div>
        <div className="summary-pill badge badge-info">{residents.filter(r => r.evacuationStatus === 'Evacuated').length} Evacuated</div>
        <div className="summary-pill badge badge-danger">{residents.filter(r => r.evacuationStatus === 'Unaccounted').length} Unaccounted</div>
        <div className="summary-pill badge badge-purple">{residents.filter(r => (r.vulnerabilityTags || []).length > 0).length} Vulnerable</div>
      </div>

      <div className="filter-row">
        <input className="form-control" placeholder="Search name or address..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:240 }}/>
        <select className="form-control" value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ maxWidth:150 }}>
          <option>All</option>{ZONES.map(z => <option key={z}>{z}</option>)}
        </select>
        <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth:160 }}>
          <option>All</option><option>Safe</option><option>Evacuated</option><option>Unaccounted</option>
        </select>
        <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-muted)' }}>{filtered.length} resident{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Zone / Address</th><th>Household</th><th>Contact</th><th>Vulnerability</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{r.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>{(r.id || '').slice(0, 8)}</div>
                  </td>
                  <td>
                    <div>{r.zone}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{r.address}</div>
                  </td>
                  <td style={{ textAlign:'center' }}>{r.householdMembers}</td>
                  <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{r.contact || '—'}</td>
                  <td>
                    {(r.vulnerabilityTags || []).length === 0
                      ? <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>
                      : (r.vulnerabilityTags || []).map(t => (
                          <span key={t} className="vuln-tag"><i className="fa-solid fa-heart-pulse"></i>{t}</span>
                        ))
                    }
                  </td>
                  <td><span className={`badge badge-${statusBadge[r.evacuationStatus]}`}>{r.evacuationStatus}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)} title="Edit"><i className="fa-solid fa-pen"></i></button>
                      <button className="btn btn-sm" style={{ background:'rgba(230,57,70,.12)', color:'var(--accent-red)', border:'1px solid rgba(230,57,70,.25)' }} onClick={() => setDeleteId(r.id)} title="Delete"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><i className="fa-solid fa-users"></i><p>No residents found. Add one above.</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <ConfirmModal
          title="Delete Resident"
          message="Remove this resident from the database?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-user" style={{ color:'var(--accent-blue)', marginRight:8 }}></i>{editing ? 'Edit Resident' : 'Add Resident'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label>Full Name</label><input className="form-control" placeholder="Full name..." value={form.name} onChange={e => setForm({ ...form, name:e.target.value })}/></div>
              <div className="form-group">
                <label>Zone</label>
                <select className="form-control" value={form.zone} onChange={e => setForm({ ...form, zone:e.target.value })}>
                  {ZONES.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Evacuation Status</label>
                <select className="form-control" value={form.evacuationStatus} onChange={e => setForm({ ...form, evacuationStatus:e.target.value })}>
                  <option>Safe</option><option>Evacuated</option><option>Unaccounted</option>
                </select>
              </div>
              <div className="form-group full"><label>Address</label><input className="form-control" placeholder="Purok / Street..." value={form.address} onChange={e => setForm({ ...form, address:e.target.value })}/></div>
              <div className="form-group"><label>Household Members</label><input className="form-control" type="number" min={1} value={form.householdMembers} onChange={e => setForm({ ...form, householdMembers:parseInt(e.target.value)||1 })}/></div>
              <div className="form-group"><label>Contact Number</label><input className="form-control" placeholder="09XX-XXX-XXXX" value={form.contact} onChange={e => setForm({ ...form, contact:e.target.value })}/></div>
              <div className="form-group full">
                <label>Vulnerability Tags</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                  {VULNERABILITY_TAGS.map(t => (
                    <button key={t} type="button"
                      className={`btn btn-sm ${form.vulnerabilityTags.includes(t) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleTag(t)}>{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop:16, display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                  : <><i className="fa-solid fa-floppy-disk"></i>{editing ? 'Save Changes' : 'Add Resident'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
