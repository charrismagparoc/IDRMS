import '../styles/Sidebar.css';
import { useApp } from '../context/AppContext';

const NAV = [
  { key:'dashboard',    label:'Dashboard',          icon:'fa-gauge-high'          },
  { key:'map',          label:'GIS Hazard Map',      icon:'fa-map-location-dot'    },
  { key:'incidents',    label:'Incidents',           icon:'fa-triangle-exclamation'},
  { key:'alerts',       label:'Alerts',              icon:'fa-bell'                },
  { key:'evacuation',   label:'Evacuation Centers',  icon:'fa-house-flag'          },
  { key:'residents',    label:'Residents',           icon:'fa-users'               },
  { key:'resources',    label:'Resources',           icon:'fa-boxes-stacked'       },
  { key:'reports',      label:'Reports & Analytics', icon:'fa-chart-bar'           },
  { key:'intelligence', label:'Risk Intelligence',   icon:'fa-brain'               },
];
const BOTTOM = [
  { key:'users',    label:'User Management', icon:'fa-shield-halved'      },
  { key:'activity', label:'Activity Log',    icon:'fa-clock-rotate-left'  },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { incidents, alerts } = useApp();
  const activeInc   = incidents.filter(i => i.status === 'Active' || i.status === 'Pending').length;
  const activeAlerts = alerts.filter(a => a.level !== 'Resolved').length;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><i className="fa-solid fa-shield-heart"></i></div>
        <div className="brand-text">
          <span className="brand-name">IDRMS</span>
          <span className="brand-sub">Brgy. Kauswagan</span>
        </div>
      </div>

      <div className="sidebar-label">MAIN MENU</div>
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button key={item.key} className={`nav-item${activePage === item.key ? ' active' : ''}`} onClick={() => onNavigate(item.key)}>
            <i className={`fa-solid ${item.icon} nav-icon`}></i>
            <span className="nav-label">{item.label}</span>
            {item.key === 'alerts'    && activeAlerts > 0 && <span className="nav-badge">{activeAlerts}</span>}
            {item.key === 'incidents' && activeInc    > 0 && <span className="nav-badge danger">{activeInc}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider"></div>
      <div className="sidebar-label">SYSTEM</div>
      <nav className="sidebar-nav">
        {BOTTOM.map(item => (
          <button key={item.key} className={`nav-item${activePage === item.key ? ' active' : ''}`} onClick={() => onNavigate(item.key)}>
            <i className={`fa-solid ${item.icon} nav-icon`}></i>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version"><i className="fa-solid fa-circle-info"></i> IDRMS v1.0 · 2026</div>
      </div>
    </aside>
  );
}
