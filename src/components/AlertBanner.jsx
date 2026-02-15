import '../styles/AlertBanner.css';

const CONFIG = {
  Danger:   { icon:'fa-circle-radiation',     cls:'alert-danger',   label:'DANGER'   },
  Warning:  { icon:'fa-triangle-exclamation', cls:'alert-warning',  label:'WARNING'  },
  Advisory: { icon:'fa-circle-info',          cls:'alert-advisory', label:'ADVISORY' },
  Resolved: { icon:'fa-circle-check',         cls:'alert-resolved', label:'RESOLVED' },
};

export default function AlertBanner({ level, message, zone, time, sentBy, onDismiss, compact }) {
  const cfg = CONFIG[level] || CONFIG.Advisory;
  return (
    <div className={`alert-banner ${cfg.cls}${compact ? ' compact' : ''}`}>
      <div className="alert-icon"><i className={`fa-solid ${cfg.icon}`}></i></div>
      <div className="alert-content">
        <div className="alert-header-row">
          <span className="alert-level-tag">{cfg.label}</span>
          <span className="alert-zone">{zone}</span>
          {time && <span className="alert-time">{new Date(time).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}</span>}
        </div>
        <p className="alert-message">{message}</p>
        {sentBy && !compact && <div className="alert-meta"><i className="fa-solid fa-user"></i> Sent by {sentBy}</div>}
      </div>
      {onDismiss && <button className="alert-dismiss" onClick={onDismiss}><i className="fa-solid fa-xmark"></i></button>}
    </div>
  );
}
