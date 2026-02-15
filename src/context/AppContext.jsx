import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, db } from '../lib/supabase';

const AppContext = createContext(null);

// ── DB row → camelCase ────────────────────────────────────────
const mapIncident = r => !r ? null : ({
  id: r.id, type: r.type, zone: r.zone, location: r.location,
  severity: r.severity, status: r.status, reporter: r.reporter,
  description: r.description,
  lat: parseFloat(r.lat) || 8.490, lng: parseFloat(r.lng) || 124.656,
  dateReported: r.date_reported,
});
const mapAlert = r => !r ? null : ({
  id: r.id, level: r.level, zone: r.zone, message: r.message,
  channel: r.channel, sentBy: r.sent_by,
  recipientsCount: r.recipients_count, sentAt: r.sent_at,
});
const mapEvac = r => !r ? null : ({
  id: r.id, name: r.name, address: r.address, zone: r.zone,
  status: r.status, capacity: r.capacity, occupancy: r.occupancy,
  contactPerson: r.contact_person, contact: r.contact,
  facilitiesAvailable: r.facilities_available || [],
  lat: parseFloat(r.lat) || 8.490, lng: parseFloat(r.lng) || 124.656,
});
const mapResident = r => !r ? null : ({
  id: r.id, name: r.name, zone: r.zone, address: r.address,
  householdMembers: r.household_members, contact: r.contact,
  evacuationStatus: r.evacuation_status,
  vulnerabilityTags: r.vulnerability_tags || [],
});
const mapResource = r => !r ? null : ({
  id: r.id, name: r.name, category: r.category,
  quantity: r.quantity, available: r.available,
  status: r.status, location: r.location,
});
const mapUser = r => !r ? null : ({
  id: r.id, name: r.name, email: r.email,
  role: r.role, status: r.status, lastLogin: r.last_login,
});
const mapLog = r => !r ? null : ({
  id: r.id, action: r.action, type: r.type,
  user: r.user_name, time: r.created_at,
});

// ── camelCase → DB row ────────────────────────────────────────
const toIncRow = d => ({ type:d.type, zone:d.zone, location:d.location, severity:d.severity, status:d.status, reporter:d.reporter, description:d.description, lat:d.lat, lng:d.lng });
const toAltRow = d => ({ level:d.level, zone:d.zone, message:d.message, channel:d.channel, sent_by:d.sentBy||'Admin', recipients_count:d.recipientsCount||0 });
const toEvcRow = d => ({ name:d.name, address:d.address, zone:d.zone, status:d.status, capacity:parseInt(d.capacity)||0, occupancy:parseInt(d.occupancy)||0, contact_person:d.contactPerson, contact:d.contact, facilities_available:d.facilitiesAvailable||[], lat:d.lat, lng:d.lng });
const toResRow = d => ({ name:d.name, zone:d.zone, address:d.address, household_members:parseInt(d.householdMembers)||1, contact:d.contact, evacuation_status:d.evacuationStatus, vulnerability_tags:d.vulnerabilityTags||[] });
const toRscRow = d => ({ name:d.name, category:d.category, quantity:parseInt(d.quantity)||0, available:parseInt(d.available)||0, status:d.status, location:d.location });
const toUsrRow = d => ({ name:d.name, email:d.email, role:d.role, status:d.status });

export function AppProvider({ children }) {
  const [incidents,   setIncidents]   = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [evacCenters, setEvacCenters] = useState([]);
  const [residents,   setResidents]   = useState([]);
  const [resources,   setResources]   = useState([]);
  const [users,       setUsers]       = useState([]);
  const [actLog,      setActLog]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [dbError,     setDbError]     = useState(null);

  // ── Load all data from Supabase ───────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [i,a,e,res,rsc,u,l] = await Promise.all([
        db.getAll('incidents',          { order:'date_reported' }),
        db.getAll('alerts',             { order:'sent_at' }),
        db.getAll('evacuation_centers', { order:'created_at', asc:true }),
        db.getAll('residents',          { order:'created_at', asc:true }),
        db.getAll('resources',          { order:'created_at', asc:true }),
        db.getAll('staff_users',        { order:'created_at', asc:true }),
        db.getAll('activity_log',       { order:'created_at' }),
      ]);
      if (i.error) throw i.error;
      setIncidents(  (i.data   || []).map(mapIncident));
      setAlerts(     (a.data   || []).map(mapAlert));
      setEvacCenters((e.data   || []).map(mapEvac));
      setResidents(  (res.data || []).map(mapResident));
      setResources(  (rsc.data || []).map(mapResource));
      setUsers(      (u.data   || []).map(mapUser));
      setActLog(     (l.data   || []).map(mapLog));
    } catch (err) {
      console.error('DB Error:', err.message);
      setDbError(err.message || 'Failed to load data from Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Activity log helper ───────────────────────────────────
  const logAct = async (action, type, userName = 'Admin') => {
    try {
      const { data } = await supabase.from('activity_log')
        .insert({ action, type, user_name: userName })
        .select().single();
      if (data) setActLog(p => [mapLog(data), ...p]);
    } catch(e) { console.warn('Log error:', e.message); }
  };

  // ══════════════════════════════════════════════════════════
  // IMPORTANT: "delete" functions ONLY remove the record from
  // the local UI state. They do NOT delete anything from the
  // Supabase database. Data is always preserved in the DB.
  // ══════════════════════════════════════════════════════════

  // ── INCIDENTS ────────────────────────────────────────────
  const addIncident = async (d) => {
    const row = { ...toIncRow(d), status:'Pending', date_reported:new Date().toISOString(),
      lat:8.490+(Math.random()-.5)*.01, lng:124.656+(Math.random()-.5)*.01 };
    const { data, error } = await db.insert('incidents', row);
    if (error) throw error;
    const inc = mapIncident(data);
    setIncidents(p => [inc, ...p]);
    await logAct(`Incident reported: ${inc.type} in ${inc.zone}`, 'Incident');
    return inc;
  };
  const updateIncident = async (id, d) => {
    const { data, error } = await db.update('incidents', id, toIncRow(d));
    if (error) throw error;
    setIncidents(p => p.map(i => i.id === id ? mapIncident(data) : i));
    await logAct(`Incident ${id} updated`, 'Incident');
  };
  // UI-only hide — database record is kept
  const deleteIncident = (id) => {
    setIncidents(p => p.filter(i => i.id !== id));
    logAct(`Incident ${id} hidden from view`, 'Incident');
  };

  // ── ALERTS ───────────────────────────────────────────────
  const addAlert = async (d) => {
    const row = { ...toAltRow(d), sent_at:new Date().toISOString(),
      recipients_count: d.zone==='All Zones' ? 1284 : Math.floor(Math.random()*250+100) };
    const { data, error } = await db.insert('alerts', row);
    if (error) throw error;
    const a = mapAlert(data);
    setAlerts(p => [a, ...p]);
    await logAct(`${a.level} alert sent to ${a.zone}`, 'Alert');
    return a;
  };
  // UI-only hide — database record is kept
  const deleteAlert = (id) => {
    setAlerts(p => p.filter(a => a.id !== id));
    logAct(`Alert ${id} hidden from view`, 'Alert');
  };

  // ── EVAC CENTERS ─────────────────────────────────────────
  const addEvacCenter = async (d) => {
    const row = { ...toEvcRow(d), lat:8.490+(Math.random()-.5)*.015, lng:124.656+(Math.random()-.5)*.015 };
    const { data, error } = await db.insert('evacuation_centers', row);
    if (error) throw error;
    const c = mapEvac(data);
    setEvacCenters(p => [...p, c]);
    await logAct(`Evac center "${c.name}" added`, 'Evacuation');
    return c;
  };
  const updateEvacCenter = async (id, d) => {
    const { data, error } = await db.update('evacuation_centers', id, toEvcRow(d));
    if (error) throw error;
    setEvacCenters(p => p.map(c => c.id === id ? mapEvac(data) : c));
    await logAct(`Evac center ${id} updated`, 'Evacuation');
  };
  // UI-only hide
  const deleteEvacCenter = (id) => {
    setEvacCenters(p => p.filter(c => c.id !== id));
    logAct(`Evac center ${id} hidden from view`, 'Evacuation');
  };

  // ── RESIDENTS ────────────────────────────────────────────
  const addResident = async (d) => {
    const { data, error } = await db.insert('residents', toResRow(d));
    if (error) throw error;
    const r = mapResident(data);
    setResidents(p => [...p, r]);
    await logAct(`Resident "${r.name}" added`, 'Resident');
    return r;
  };
  const updateResident = async (id, d) => {
    const { data, error } = await db.update('residents', id, toResRow(d));
    if (error) throw error;
    setResidents(p => p.map(r => r.id === id ? mapResident(data) : r));
    await logAct(`Resident ${id} updated`, 'Resident');
  };
  // UI-only hide
  const deleteResident = (id) => {
    setResidents(p => p.filter(r => r.id !== id));
    logAct(`Resident ${id} hidden from view`, 'Resident');
  };

  // ── RESOURCES ────────────────────────────────────────────
  const addResource = async (d) => {
    const { data, error } = await db.insert('resources', toRscRow(d));
    if (error) throw error;
    const r = mapResource(data);
    setResources(p => [...p, r]);
    await logAct(`Resource "${r.name}" added`, 'Resource');
    return r;
  };
  const updateResource = async (id, d) => {
    const { data, error } = await db.update('resources', id, toRscRow(d));
    if (error) throw error;
    setResources(p => p.map(r => r.id === id ? mapResource(data) : r));
    await logAct(`Resource ${id} updated`, 'Resource');
  };
  // UI-only hide
  const deleteResource = (id) => {
    setResources(p => p.filter(r => r.id !== id));
    logAct(`Resource ${id} hidden from view`, 'Resource');
  };

  // ── USERS ────────────────────────────────────────────────
  const addUser = async (d) => {
    const { data, error } = await db.insert('staff_users', { ...toUsrRow(d), last_login:new Date().toISOString() });
    if (error) throw error;
    const u = mapUser(data);
    setUsers(p => [...p, u]);
    await logAct(`User "${u.name}" created`, 'Resident');
    return u;
  };
  const updateUser = async (id, d) => {
    const { data, error } = await db.update('staff_users', id, toUsrRow(d));
    if (error) throw error;
    setUsers(p => p.map(u => u.id === id ? mapUser(data) : u));
    await logAct(`User ${id} updated`, 'Resident');
  };
  // UI-only hide
  const deleteUser = (id) => {
    setUsers(p => p.filter(u => u.id !== id));
    logAct(`User ${id} hidden from view`, 'Resident');
  };

  return (
    <AppContext.Provider value={{
      loading, dbError, refresh: loadAll,
      incidents,   addIncident,   updateIncident,   deleteIncident,
      alerts,      addAlert,      deleteAlert,
      evacCenters, addEvacCenter, updateEvacCenter, deleteEvacCenter,
      residents,   addResident,   updateResident,   deleteResident,
      resources,   addResource,   updateResource,   deleteResource,
      users,       addUser,       updateUser,       deleteUser,
      actLog,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
