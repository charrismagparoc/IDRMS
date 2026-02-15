// IDRMS — UI Constants & Map Reference Data
// All live records (incidents, alerts, residents, etc.) come from Supabase.
// No mock data here — the database is the single source of truth.

// ─── Weather (static — replace with PAGASA API when available) ──
export const weatherData = {
  condition: 'Heavy Rain', temperature: 27, humidity: 91,
  windSpeed: 45, rainfall24h: 78.4, riskLevel: 'High',
  pagasaAdvisory: 'Tropical depression developing east of Mindanao may bring heavy rainfall to Misamis Oriental within the next 24 hours. Residents in flood and landslide-prone areas are advised to take precautionary measures.',
};

// ─── Zone reference labels (risk levels are display labels only) ─
export const zoneRiskLevels = [
  { zone:'Zone 1', riskLevel:'Medium', mainHazard:'Fire'       },
  { zone:'Zone 2', riskLevel:'Low',    mainHazard:'Flood'      },
  { zone:'Zone 3', riskLevel:'High',   mainHazard:'Flood'      },
  { zone:'Zone 4', riskLevel:'Low',    mainHazard:'Earthquake' },
  { zone:'Zone 5', riskLevel:'High',   mainHazard:'Landslide'  },
  { zone:'Zone 6', riskLevel:'Medium', mainHazard:'Storm'      },
];

// ─── UI Select constants ──────────────────────────────────────
export const ZONES             = ['Zone 1','Zone 2','Zone 3','Zone 4','Zone 5','Zone 6'];
export const INCIDENT_TYPES    = ['Flood','Fire','Landslide','Storm','Earthquake'];
export const INCIDENT_STATUSES = ['Active','Pending','Verified','Responded','Resolved'];
export const RESOURCE_CATEGORIES  = ['Equipment','Medical','Food Supply','Vehicle','Safety Gear'];
export const VULNERABILITY_TAGS   = ['Senior Citizen','PWD','Pregnant','Infant','Bedridden'];
export const EVAC_FACILITIES      = ['Water','Restroom','Medical','Power','Food','Sleeping Area'];

// ─── Map polygons — Barangay Kauswagan hazard zones ──────────
export const hazardZonePolygons = [
  { id:'hz-flood-3',     label:'Zone 3 – High Flood Risk', color:'#e63946', fillOpacity:0.18,
    coords:[[8.4920,124.6530],[8.4935,124.6555],[8.4918,124.6580],[8.4905,124.6560],[8.4910,124.6535]] },
  { id:'hz-landslide-5', label:'Zone 5 – Landslide Prone', color:'#f4a261', fillOpacity:0.18,
    coords:[[8.4950,124.6620],[8.4965,124.6650],[8.4945,124.6668],[8.4930,124.6645],[8.4940,124.6618]] },
  { id:'hz-fire-1',      label:'Zone 1 – Fire Risk Area',  color:'#f9c74f', fillOpacity:0.14,
    coords:[[8.4870,124.6510],[8.4885,124.6530],[8.4872,124.6548],[8.4858,124.6532],[8.4862,124.6512]] },
];

export const BARANGAY_HALL = { lat:8.4887, lng:124.6558, name:'Barangay Kauswagan Hall' };
export const MAP_CENTER    = [8.490, 124.656];
