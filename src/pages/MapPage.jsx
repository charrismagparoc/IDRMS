import { useEffect, useRef, useState } from 'react';
import '../styles/MapPage.css';
import { useApp } from '../context/AppContext';

const TYPE_COLOR = { Flood:'#4cc9f0', Fire:'#e63946', Landslide:'#f4a261', Storm:'#f9c74f', Earthquake:'#b39ddb' };

const FILTERS = [
  { key:'all',        label:'All Layers',   icon:'fa-layer-group'          },
  { key:'hazard',     label:'Hazard Zones', icon:'fa-triangle-exclamation' },
  { key:'evacuation', label:'Evacuation',   icon:'fa-house-flag'           },
  { key:'incidents',  label:'Incidents',    icon:'fa-circle-radiation'     },
];

export default function MapPage() {
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const layerRefs = useRef({});
  const [filter, setFilter]     = useState('all');
  const [legend, setLegend]     = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const { evacCenters, incidents } = useApp();

  // Build or rebuild map
  useEffect(() => {
    const build = () => {
      if (mapInst.current || !window.L || !mapRef.current) return;
      const L = window.L;
      mapInst.current = L.map(mapRef.current, { center:[8.490,124.656], zoom:15 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap', maxZoom:19 }).addTo(mapInst.current);

      // Hazard zones
      const hazardGrp = L.layerGroup();
      [
        { coords:[[8.493,124.652],[8.495,124.658],[8.491,124.660],[8.489,124.654]], color:'#e63946', label:'Zone 3 — High Flood Risk'    },
        { coords:[[8.494,124.660],[8.497,124.665],[8.493,124.666],[8.491,124.661]], color:'#f4a261', label:'Zone 5 — Landslide Prone'    },
        { coords:[[8.486,124.652],[8.489,124.656],[8.487,124.658],[8.484,124.654]], color:'#f9c74f', label:'Zone 1 — Fire Risk'           },
      ].forEach(z => L.polygon(z.coords,{color:z.color,fillColor:z.color,fillOpacity:0.2,weight:2}).addTo(hazardGrp).bindPopup(`<b>${z.label}</b>`));
      layerRefs.current.hazard = hazardGrp;
      hazardGrp.addTo(mapInst.current);

      // Evac centers
      const evacGrp = L.layerGroup();
      evacCenters.forEach(e => {
        const sc = e.status==='Open'?'#06d6a0':e.status==='Full'?'#e63946':'#4a5568';
        const icon = L.divIcon({ className:'', html:`<div style="background:${sc};color:#fff;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;white-space:nowrap;border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,.5)">🏫 ${e.status}</div>` });
        L.marker([e.lat,e.lng],{icon}).addTo(evacGrp).bindPopup(`<b>${e.name}</b><br>Status: ${e.status}<br>Occupancy: ${e.occupancy}/${e.capacity}<br>Contact: ${e.contactPerson}`);
      });
      layerRefs.current.evacuation = evacGrp;
      evacGrp.addTo(mapInst.current);

      // Incidents
      const incGrp = L.layerGroup();
      incidents.forEach(inc => {
        const c = TYPE_COLOR[inc.type]||'#888';
        const icon = L.divIcon({ className:'', html:`<div style="background:${c};color:#000;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">⚠</div>` });
        L.marker([inc.lat,inc.lng],{icon}).addTo(incGrp).bindPopup(`<b>${inc.type}</b><br>${inc.location}<br>Status: <b>${inc.status}</b><br>Severity: ${inc.severity}`);
      });
      layerRefs.current.incidents = incGrp;
      incGrp.addTo(mapInst.current);

      // Brgy Hall
      const hallIcon = L.divIcon({ className:'', html:'<div style="background:#7b5ea7;color:#fff;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,.5)">🏛 BRGY HALL</div>' });
      L.marker([8.4895,124.6558],{icon:hallIcon}).addTo(mapInst.current).bindPopup('<b>Barangay Kauswagan Hall</b><br>BDRRMC Command Center<br>CDO, Misamis Oriental');

      setMapReady(true);
    };

    if (window.L) { build(); }
    else { const t=setInterval(()=>{ if(window.L){clearInterval(t);build();} },200); return()=>clearInterval(t); }
    return () => { if(mapInst.current){mapInst.current.remove();mapInst.current=null;} };
  }, []);

  // Filter layers
  useEffect(() => {
    if (!mapInst.current) return;
    ['hazard','evacuation','incidents'].forEach(k => {
      const g = layerRefs.current[k];
      if (!g) return;
      if (filter==='all'||filter===k) { if(!mapInst.current.hasLayer(g)) g.addTo(mapInst.current); }
      else { if(mapInst.current.hasLayer(g)) mapInst.current.removeLayer(g); }
    });
  }, [filter]);

  return (
    <div className="map-page">
      <div className="page-header">
        <div>
          <div className="page-title">GIS Hazard Map</div>
          <div className="page-subtitle">Barangay Kauswagan, Cagayan de Oro City, Misamis Oriental — 8.490°N, 124.656°E</div>
        </div>
      </div>
      <div className="map-toolbar">
        {FILTERS.map(f => (
          <button key={f.key} className={`btn ${filter===f.key?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(f.key)}>
            <i className={`fa-solid ${f.icon}`}></i> {f.label}
          </button>
        ))}
        <button className="btn btn-outline ml-auto" onClick={()=>setLegend(!legend)}>
          <i className="fa-solid fa-list"></i> {legend?'Hide':'Show'} Legend
        </button>
      </div>
      <div className="map-container-wrap">
        <div ref={mapRef} className="leaflet-map-div"></div>
        {legend && (
          <div className="map-legend">
            <div className="legend-title"><i className="fa-solid fa-circle-info"></i> Legend</div>
            {[['#e63946','High Flood Risk'],['#f4a261','Landslide Prone'],['#f9c74f','Fire Risk Zone']].map(([c,l])=>(
              <div key={l} className="legend-item"><span className="legend-dot" style={{background:c,opacity:.8}}></span>{l}</div>
            ))}
            <div className="legend-divider"></div>
            <div className="legend-item"><span className="legend-square" style={{background:'#06d6a0',color:'#fff',fontSize:10}}>🏫</span>Evac (Open)</div>
            <div className="legend-item"><span className="legend-square" style={{background:'#e63946',color:'#fff',fontSize:10}}>🏫</span>Evac (Full)</div>
            <div className="legend-item"><span className="legend-square" style={{background:'#7b5ea7',color:'#fff',fontSize:10}}>🏛</span>Brgy Hall</div>
            <div className="legend-item"><span className="legend-square" style={{background:'#4cc9f0',color:'#000',fontSize:12}}>⚠</span>Incident</div>
          </div>
        )}
      </div>
    </div>
  );
}
