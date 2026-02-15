import '../styles/StatCard.css';

const COLORS = {
  red:    { bg:'rgba(230,57,70,0.12)',  border:'rgba(230,57,70,0.25)',  text:'#e63946' },
  blue:   { bg:'rgba(76,201,240,0.1)', border:'rgba(76,201,240,0.25)', text:'#4cc9f0' },
  green:  { bg:'rgba(6,214,160,0.1)',  border:'rgba(6,214,160,0.25)',  text:'#06d6a0' },
  orange: { bg:'rgba(244,162,97,0.12)',border:'rgba(244,162,97,0.25)', text:'#f4a261' },
  purple: { bg:'rgba(123,94,167,0.12)',border:'rgba(123,94,167,0.25)', text:'#b39ddb' },
  yellow: { bg:'rgba(249,199,79,0.1)', border:'rgba(249,199,79,0.25)', text:'#f9c74f' },
};

export default function StatCard({ title, value, icon, color, change, changeLabel, trend }) {
  const c = COLORS[color] || COLORS.blue;
  return (
    <div className="stat-card" style={{ borderColor: c.border }}>
      <div className="stat-icon-wrap" style={{ background: c.bg }}>
        <i className={`fa-solid ${icon}`} style={{ color: c.text }}></i>
      </div>
      <div className="stat-body">
        <div className="stat-title">{title}</div>
        <div className="stat-value" style={{ color: c.text }}>{value}</div>
        {change !== undefined && (
          <div className={`stat-change ${trend}`}>
            <i className={`fa-solid fa-arrow-${trend === 'up' ? 'up' : 'down'}-right`}></i>
            <span>{change} {changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
