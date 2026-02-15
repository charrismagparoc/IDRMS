import { useState } from 'react';
import '../styles/Login.css';
import { signIn } from '../lib/supabase';

export default function Login({ onLogin }) {
  const [form,     setForm]     = useState({ email:'', password:'' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const { data, error: authError } = await signIn(form.email, form.password);
      if (authError) throw authError;
      const user = data?.user;
      if (!user) throw new Error('Login failed. No user returned.');
      const role = form.email.startsWith('admin') ? 'Admin' : 'Staff';
      const name = user.email.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      onLogin({ id:user.id, name, role, email:user.email });
    } catch(err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Wrong email or password. Create users in: Supabase Dashboard → Authentication → Users');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-grid"></div>
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon"><i className="fa-solid fa-shield-heart"></i></div>
          <h1 className="login-brand-name">IDRMS</h1>
          <p className="login-brand-desc">Intelligent Disaster Risk Management System</p>
          <div className="login-barangay"><i className="fa-solid fa-location-dot"></i> Barangay Kauswagan, Cagayan de Oro City</div>
        </div>
        <div className="login-feature-list">
          {[
            { icon:'fa-map-location-dot', label:'GIS Hazard Mapping — OpenStreetMap + Leaflet' },
            { icon:'fa-bell',             label:'Real-Time Alert Broadcast System' },
            { icon:'fa-house-flag',       label:'Evacuation Center Management' },
            { icon:'fa-brain',            label:'Risk Intelligence Engine' },
            { icon:'fa-database',         label:'Supabase PostgreSQL Database' },
            { icon:'fa-file-pdf',         label:'Branded PDF Report Export' },
          ].map(f => (
            <div key={f.label} className="login-feature-item">
              <i className={`fa-solid ${f.icon}`}></i><span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Admin Login</h2>
            <p>Sign in with your Supabase credentials</p>
          </div>
          {error && (
            <div className="login-error"><i className="fa-solid fa-circle-exclamation"></i>{error}</div>
          )}
          <div className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-envelope"></i>
                <input className="form-control" type="email" placeholder="admin@kauswagan.gov.ph"
                  value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-lock"></i>
                <input className="form-control" type={showPass?'text':'password'} placeholder="••••••••"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
                <button className="toggle-pass" onClick={()=>setShowPass(!showPass)} tabIndex={-1}>
                  <i className={`fa-solid ${showPass?'fa-eye-slash':'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button className="btn btn-primary login-btn" onClick={handleSubmit} disabled={loading}>
              {loading?<><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</>:<><i className="fa-solid fa-right-to-bracket"></i> Sign In</>}
            </button>
          </div>
          <div className="login-hint">
            <i className="fa-solid fa-circle-info"></i>
            <div>
              <strong>Default credentials:</strong><br/>
              <code>admin@kauswagan.gov.ph</code> / <code>Admin@IDRMS2026</code><br/>
              <span style={{fontSize:11,opacity:.7}}>Create users in: Supabase Dashboard → Authentication → Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
