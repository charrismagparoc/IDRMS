import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import IncidentsPage from './pages/IncidentsPage';
import AlertsPage from './pages/AlertsPage';
import { EvacuationPage, ResidentsPage } from './pages/EvacResidents';
import { ResourcesPage, ReportsPage, IntelligencePage, UsersPage, ActivityPage } from './pages/OtherPages';

function LoadingScreen() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0e1a', gap:20 }}>
      <div style={{ width:60, height:60, background:'linear-gradient(135deg,#e63946,#c9303c)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#fff' }}>
        <i className="fa-solid fa-shield-heart"></i>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:24, fontWeight:800, color:'#e8eaf0', fontFamily:'Orbitron,sans-serif' }}>IDRMS</div>
        <div style={{ color:'#4cc9f0', fontSize:13, marginTop:4 }}>Connecting to Supabase...</div>
      </div>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:22, color:'#4cc9f0' }}></i>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0e1a', gap:16, padding:24 }}>
      <i className="fa-solid fa-database" style={{ fontSize:48, color:'#e63946', opacity:.7 }}></i>
      <h2 style={{ color:'#e8eaf0' }}>Database Connection Error</h2>
      <div style={{ background:'rgba(230,57,70,.1)', border:'1px solid rgba(230,57,70,.3)', borderRadius:10, padding:'12px 20px', maxWidth:480, textAlign:'center' }}>
        <p style={{ color:'#e63946', fontSize:13 }}>{message}</p>
      </div>
      <p style={{ color:'#88929c', fontSize:12, maxWidth:400, textAlign:'center' }}>
        Make sure you ran <code style={{color:'#4cc9f0'}}>supabase/schema.sql</code> in your Supabase SQL Editor and that your project is active.
      </p>
      <button className="btn btn-primary" onClick={onRetry}><i className="fa-solid fa-rotate-right"></i> Retry Connection</button>
    </div>
  );
}

function AppInner() {
  const { loading, dbError, refresh } = useApp();
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [activePage,   setActivePage]   = useState('dashboard');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u    = session.user;
        const role = u.email?.startsWith('admin') ? 'Admin' : 'Staff';
        const name = u.email?.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        setCurrentUser({ id:u.id, name, role, email:u.email });
        setIsLoggedIn(true);
      }
      setCheckingAuth(false);
    }).catch(() => setCheckingAuth(false));

    const { data:{ subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false); setCurrentUser(null); setActivePage('dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin  = (user) => { setCurrentUser(user); setIsLoggedIn(true); };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false); setCurrentUser(null); setActivePage('dashboard');
  };

  if (checkingAuth || loading) return <LoadingScreen />;
  if (dbError && isLoggedIn)   return <ErrorScreen message={dbError} onRetry={refresh} />;
  if (!isLoggedIn)             return <Login onLogin={handleLogin} />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard />;
      case 'map':          return <MapPage />;
      case 'incidents':    return <IncidentsPage />;
      case 'alerts':       return <AlertsPage />;
      case 'evacuation':   return <EvacuationPage />;
      case 'residents':    return <ResidentsPage />;
      case 'resources':    return <ResourcesPage />;
      case 'reports':      return <ReportsPage />;
      case 'intelligence': return <IntelligencePage />;
      case 'users':        return <UsersPage />;
      case 'activity':     return <ActivityPage />;
      default:             return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <Topbar activePage={activePage} currentUser={currentUser} onLogout={handleLogout} />
        <main className="page-body">{renderPage()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
