import { useState } from 'react';
import '../styles/Topbar.css';
import { weatherData } from '../data/mockData';
import { useApp } from '../context/AppContext';

const TITLES = { dashboard:'Dashboard', map:'GIS Hazard Map', incidents:'Incident Management', alerts:'Alert System', evacuation:'Evacuation Centers', residents:'Resident Management', resources:'Resource Management', reports:'Reports & Analytics', intelligence:'Risk Intelligence', users:'User Management', activity:'Activity Log' };
const RISK_COLOR = { High:'var(--accent-red)', Medium:'var(--accent-orange)', Low:'var(--accent-green)' };

export default function Topbar({ activePage, currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const { alerts } = useApp();
  const n = alerts.filter(a => a.level !== 'Resolved').length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{TITLES[activePage] || 'Dashboard'}</h2>
        <div className="weather-strip">
          <div className="weather-item"><i className="fa-solid fa-cloud-rain"></i><span>{weatherData.condition}</span></div>
          <div className="weather-item"><i className="fa-solid fa-temperature-half"></i><span>{weatherData.temperature}°C</span></div>
          <div className="weather-item"><i className="fa-solid fa-wind"></i><span>{weatherData.windSpeed} km/h</span></div>
          <div className="risk-chip" style={{ color: RISK_COLOR[weatherData.riskLevel], borderColor: RISK_COLOR[weatherData.riskLevel]+'44', background: RISK_COLOR[weatherData.riskLevel]+'14' }}>
            <i className="fa-solid fa-circle-exclamation"></i>{weatherData.riskLevel} Risk
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <i className="fa-solid fa-bell"></i>
          {n > 0 && <span className="topbar-badge">{n}</span>}
        </button>
        <div className="topbar-datetime">
          <i className="fa-regular fa-calendar"></i><span>Feb 14, 2026</span>
        </div>
        <div className="user-menu-wrapper">
          <button className="user-btn" onClick={() => setOpen(!open)}>
            <div className="user-avatar">{(currentUser?.name || 'A').charAt(0)}</div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'Admin'}</span>
              <span className="user-role">{currentUser?.role || 'Administrator'}</span>
            </div>
            <i className={`fa-solid fa-chevron-${open?'up':'down'} user-chevron`}></i>
          </button>
          {open && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-avatar lg">{(currentUser?.name||'A').charAt(0)}</div>
                <div>
                  <div className="user-name">{currentUser?.name}</div>
                  <div className="user-email">{currentUser?.email}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item"><i className="fa-solid fa-user"></i> Profile</button>
              <button className="dropdown-item"><i className="fa-solid fa-gear"></i> Settings</button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={onLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
