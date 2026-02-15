export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color:'var(--accent-orange)' }}>
            <i className="fa-solid fa-eye-slash" style={{ marginRight:8 }}></i>{title}
          </h3>
          <button className="modal-close" onClick={onCancel}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <p style={{ color:'var(--text-secondary)', marginBottom:12, lineHeight:1.6 }}>{message}</p>
        <div style={{ background:'rgba(76,201,240,.08)', border:'1px solid rgba(76,201,240,.2)', borderRadius:8, padding:'10px 14px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <i className="fa-solid fa-database" style={{ color:'var(--accent-blue)', fontSize:16, flexShrink:0 }}></i>
          <span style={{ fontSize:12, color:'var(--accent-blue)' }}>
            This record will be <strong>hidden from the UI only</strong>. The data is <strong>preserved in the Supabase database</strong> and can be restored at any time.
          </span>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" style={{ background:'rgba(244,162,97,.2)', color:'var(--accent-orange)', border:'1px solid rgba(244,162,97,.4)' }} onClick={onConfirm}>
            <i className="fa-solid fa-eye-slash"></i> Hide from View
          </button>
        </div>
      </div>
    </div>
  );
}
