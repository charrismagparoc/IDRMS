# IDRMS — Intelligent Disaster Risk Management System
**Barangay Kauswagan, Cagayan de Oro City, Misamis Oriental**

---

## Tech Stack
- **Frontend:** React 18 + Vite
- **Database:** Supabase (PostgreSQL / MySQL-compatible)
- **Auth:** Supabase Auth
- **Map:** Leaflet.js + OpenStreetMap (Kauswagan, CDO coordinates)
- **PDF Export:** jsPDF + jspdf-autotable (dark-themed, branded)

---

## Supabase Setup (Step-by-Step)

### Step 1 — Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose **Region: Southeast Asia (Singapore)**
3. Set a strong database password
4. Wait for project to be ready (~2 minutes)

### Step 2 — Run the SQL Schema
1. In your Supabase Dashboard, click **SQL Editor** → **New Query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run** — this creates all 7 tables + indexes + RLS policies + seed data

### Step 3 — Create Auth Users
1. Go to **Authentication** → **Users** → **Add User**
2. Create these two users:
   - Email: `admin@kauswagan.gov.ph` | Password: `Admin@IDRMS2026`
   - Email: `staff@kauswagan.gov.ph` | Password: `Staff@IDRMS2026`

### Step 4 — Get Your API Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public key** (long JWT string)

### Step 5 — Configure the App
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

---

## Running the App

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open: `http://localhost:5173`

---

## Database Tables

| Table                | Description                          |
|----------------------|--------------------------------------|
| `incidents`          | Disaster incident reports            |
| `alerts`             | Emergency broadcasts sent            |
| `evacuation_centers` | Evacuation center records            |
| `residents`          | Resident database with vulnerability |
| `resources`          | Equipment and supplies inventory     |
| `staff_users`        | System user accounts                 |
| `activity_log`       | Full audit trail of all actions      |

---

## PDF Report Export

The **Reports** page generates a 7-section branded PDF:

1. **Executive Summary** — stat cards + incident type bars + zone risk table
2. **Incident Report** — full incident table with color-coded severity/status
3. **Alert History** — all alerts with level, zone, channel, recipients
4. **Evacuation Centers** — capacity, occupancy %, facilities
5. **Resident Database** — evacuation status, vulnerability tags
6. **Resource Inventory** — availability bars, deployment status
7. **Activity Log** — complete audit trail

All pages include:
- IDRMS dark-themed header with branding
- Color-coded status badges (red/orange/green/blue)
- Confidential footer with page numbers
- Generated timestamp

---

## File Structure

```
src/
├── App.jsx                    # Root + session handling
├── main.jsx                   # Entry point
├── lib/
│   ├── supabase.js            # Supabase client + CRUD helpers
│   └── pdfExport.js           # PDF generator (jsPDF)
├── context/
│   └── AppContext.jsx         # Global state + all async CRUD
├── data/
│   └── mockData.js            # Constants, map polygons, zone data
├── components/
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── AlertBanner.jsx
│   ├── StatCard.jsx
│   └── ConfirmModal.jsx
├── pages/
│   ├── Login.jsx              # Supabase Auth login
│   ├── Dashboard.jsx
│   ├── MapPage.jsx            # Leaflet + OSM (8.490°N, 124.656°E)
│   ├── IncidentsPage.jsx
│   ├── AlertsPage.jsx
│   ├── EvacResidents.jsx
│   └── OtherPages.jsx        # Resources, Reports (PDF), Intelligence, Users, Activity
└── styles/
    ├── index.css
    ├── Sidebar.css
    ├── Topbar.css
    ├── Dashboard.css
    ├── Login.css
    ├── MapPage.css
    ├── Pages.css
    ├── StatCard.css
    └── AlertBanner.css

supabase/
└── schema.sql                 # Full MySQL-compatible schema for Supabase
```

---

## Login Credentials (after Supabase setup)
| Role  | Email                          | Password         |
|-------|-------------------------------|------------------|
| Admin | admin@kauswagan.gov.ph        | Admin@IDRMS2026  |
| Staff | staff@kauswagan.gov.ph        | Staff@IDRMS2026  |
