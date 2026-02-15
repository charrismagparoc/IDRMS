-- ============================================================
-- IDRMS — SAFE TO RE-RUN — All triggers use DROP IF EXISTS
-- Barangay Kauswagan, Cagayan de Oro City
-- Paste this into: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- DROP TRIGGERS FIRST (fixes "already exists" error)
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_incidents_updated_at          ON public.incidents;
DROP TRIGGER IF EXISTS trg_evacuation_centers_updated_at ON public.evacuation_centers;
DROP TRIGGER IF EXISTS trg_residents_updated_at          ON public.residents;
DROP TRIGGER IF EXISTS trg_resources_updated_at          ON public.resources;
DROP TRIGGER IF EXISTS trg_staff_users_updated_at        ON public.staff_users;

-- DROP OLD POLICIES (fixes "already exists" error on policies)
DROP POLICY IF EXISTS "authenticated_all" ON public.incidents;
DROP POLICY IF EXISTS "authenticated_all" ON public.alerts;
DROP POLICY IF EXISTS "authenticated_all" ON public.evacuation_centers;
DROP POLICY IF EXISTS "authenticated_all" ON public.residents;
DROP POLICY IF EXISTS "authenticated_all" ON public.resources;
DROP POLICY IF EXISTS "authenticated_all" ON public.activity_log;
DROP POLICY IF EXISTS "authenticated_all" ON public.staff_users;

-- ─────────────────────────────────────────────────────────────
-- TABLES (IF NOT EXISTS — won't overwrite existing data)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_users (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'Staff'   CHECK (role   IN ('Admin','Staff')),
  status     TEXT        NOT NULL DEFAULT 'Active'  CHECK (status IN ('Active','Inactive')),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incidents (
  id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  type          TEXT        NOT NULL CHECK (type     IN ('Flood','Fire','Landslide','Storm','Earthquake')),
  zone          TEXT        NOT NULL,
  location      TEXT        NOT NULL,
  severity      TEXT        NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low','Medium','High')),
  status        TEXT        NOT NULL DEFAULT 'Pending' CHECK (status  IN ('Active','Pending','Verified','Responded','Resolved')),
  reporter      TEXT        NOT NULL,
  description   TEXT,
  lat           DECIMAL(10,7),
  lng           DECIMAL(10,7),
  date_reported TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id               UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  level            TEXT        NOT NULL CHECK (level   IN ('Danger','Warning','Advisory','Resolved')),
  zone             TEXT        NOT NULL,
  message          TEXT        NOT NULL,
  channel          TEXT        NOT NULL DEFAULT 'Web'   CHECK (channel IN ('Web','Web + SMS','SMS Only')),
  sent_by          TEXT        NOT NULL DEFAULT 'Admin',
  recipients_count INT         DEFAULT 0,
  sent_at          TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evacuation_centers (
  id                   UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                 TEXT        NOT NULL,
  address              TEXT,
  zone                 TEXT        NOT NULL,
  status               TEXT        NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Full','Closed')),
  capacity             INT         NOT NULL DEFAULT 100,
  occupancy            INT         NOT NULL DEFAULT 0,
  contact_person       TEXT,
  contact              TEXT,
  facilities_available TEXT[]      DEFAULT '{}',
  lat                  DECIMAL(10,7),
  lng                  DECIMAL(10,7),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.residents (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name              TEXT        NOT NULL,
  zone              TEXT        NOT NULL,
  address           TEXT,
  household_members INT         DEFAULT 1,
  contact           TEXT,
  evacuation_status TEXT        NOT NULL DEFAULT 'Safe' CHECK (evacuation_status IN ('Safe','Evacuated','Unaccounted')),
  vulnerability_tags TEXT[]     DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT        NOT NULL,
  category   TEXT        NOT NULL CHECK (category IN ('Equipment','Medical','Food Supply','Vehicle','Safety Gear')),
  quantity   INT         NOT NULL DEFAULT 0,
  available  INT         NOT NULL DEFAULT 0,
  status     TEXT        NOT NULL DEFAULT 'Available' CHECK (status IN ('Available','Partially Deployed','Deployed','In Use')),
  location   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  action     TEXT        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('Alert','Incident','Evacuation','Resource','Resident')),
  user_name  TEXT        NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_incidents_status    ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_zone      ON public.incidents(zone);
CREATE INDEX IF NOT EXISTS idx_incidents_type      ON public.incidents(type);
CREATE INDEX IF NOT EXISTS idx_alerts_level        ON public.alerts(level);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_at      ON public.alerts(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_residents_zone      ON public.residents(zone);
CREATE INDEX IF NOT EXISTS idx_residents_evac      ON public.residents(evacuation_status);
CREATE INDEX IF NOT EXISTS idx_resources_category  ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_activity_created    ON public.activity_log(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER FUNCTION + TRIGGERS
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers are safe now because we dropped them above
CREATE TRIGGER trg_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_evacuation_centers_updated_at
  BEFORE UPDATE ON public.evacuation_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_residents_updated_at
  BEFORE UPDATE ON public.residents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_staff_users_updated_at
  BEFORE UPDATE ON public.staff_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.incidents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evacuation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all" ON public.incidents          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.alerts             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.evacuation_centers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.residents          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.resources          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.activity_log       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON public.staff_users        FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA (ON CONFLICT DO NOTHING — safe to re-run)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.staff_users (name, email, role, status) VALUES
  ('Barangay Admin',     'admin@kauswagan.gov.ph',  'Admin', 'Active'),
  ('Staff Cruz',         'staff@kauswagan.gov.ph',  'Staff', 'Active'),
  ('Field Officer Tan',  'tan@kauswagan.gov.ph',    'Staff', 'Active'),
  ('Data Encoder Reyes', 'reyes@kauswagan.gov.ph',  'Staff', 'Inactive')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.evacuation_centers (name, address, zone, status, capacity, occupancy, contact_person, contact, facilities_available, lat, lng) VALUES
  ('Kauswagan Covered Court',     'Purok 1, Barangay Kauswagan',   'Zone 1', 'Open',   250, 142, 'Brgy Captain Ramos', '0917-123-4567', ARRAY['Water','Restroom','Power'],           8.4893, 124.6555),
  ('Kauswagan Elementary School', 'Purok 3, Barangay Kauswagan',   'Zone 2', 'Open',   400, 387, 'Principal Suarez',   '0918-234-5678', ARRAY['Water','Restroom','Medical','Power'], 8.4912, 124.6540),
  ('Zone 4 Multipurpose Hall',    'Purok 6, Barangay Kauswagan',   'Zone 4', 'Full',   150, 150, 'Zone 4 Leader Cruz', '0919-345-6789', ARRAY['Water','Restroom'],                   8.4930, 124.6570),
  ('Barangay Hall Annex',         'Main Road, Barangay Kauswagan', 'Zone 1', 'Open',   100,  45, 'SK Chair Dela Cruz', '0920-456-7890', ARRAY['Water','Power'],                      8.4882, 124.6558),
  ('Zone 6 Chapel Hall',          'Coastal Area, Zone 6',          'Zone 6', 'Closed',  80,   0, 'Fr. Santos',         '0921-567-8901', ARRAY['Water','Restroom'],                   8.4958, 124.6590)
ON CONFLICT DO NOTHING;

INSERT INTO public.resources (name, category, quantity, available, status, location) VALUES
  ('Life Jackets',         'Safety Gear',  50,  35, 'Partially Deployed', 'Barangay Hall Storage'),
  ('Rescue Boats',         'Equipment',     3,   1, 'Deployed',           'Zone 3 River Bank'),
  ('Emergency Food Packs', 'Food Supply', 200, 180, 'Available',          'Barangay Hall Storage'),
  ('First Aid Kits',       'Medical',      30,  22, 'Partially Deployed', 'Evac Center 1'),
  ('Megaphones',           'Equipment',     5,   3, 'Partially Deployed', 'BDRRMC Office'),
  ('Tarpaulins (10x12ft)', 'Equipment',   100, 100, 'Available',          'Zone 4 Storage'),
  ('Ambulance',            'Vehicle',       1,   1, 'Available',          'Barangay Hall'),
  ('Medicines (Basic)',    'Medical',      15,  10, 'Partially Deployed', 'Evac Center 2')
ON CONFLICT DO NOTHING;

INSERT INTO public.incidents (type, zone, location, severity, status, reporter, description, lat, lng, date_reported) VALUES
  ('Flood',     'Zone 3', 'Purok 4, near Cagayan River bank', 'High',   'Active',    'Juan dela Cruz', 'Rapid rise of floodwater reaching knee-level. Approximately 30 households affected.', 8.4903, 124.6548, NOW() - INTERVAL '2 hours'),
  ('Landslide', 'Zone 5', 'Hillside area, Purok 7',           'High',   'Pending',   'Maria Santos',   'Heavy rains triggered a minor landslide blocking the access road.',                   8.4945, 124.6635, NOW() - INTERVAL '4 hours'),
  ('Fire',      'Zone 1', 'Purok 2, residential area',        'Medium', 'Responded', 'Pedro Reyes',    'House fire, origin believed to be electrical. BFP on-site.',                          8.4875, 124.6525, NOW() - INTERVAL '1 day'),
  ('Storm',     'Zone 6', 'Coastal Purok 8',                  'Medium', 'Verified',  'Ana Lim',        'Strong winds damaged several rooftops and a fishing boat capsized.',                  8.4955, 124.6600, NOW() - INTERVAL '6 hours'),
  ('Flood',     'Zone 2', 'Purok 1, low-lying area',          'Low',    'Resolved',  'Carlos Bautista','Minor flooding cleared after 2 hours. No casualties reported.',                       8.4888, 124.6530, NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

INSERT INTO public.alerts (level, zone, message, channel, sent_by, recipients_count, sent_at) VALUES
  ('Danger',   'Zone 3',   'FLOOD WARNING: Water level critically high near Cagayan River. Zone 3 residents must evacuate immediately to nearest evacuation center.',   'Web + SMS', 'Admin', 312,  NOW() - INTERVAL '1 hour'),
  ('Warning',  'Zone 5',   'LANDSLIDE ADVISORY: Hillside areas in Zone 5 are at risk. Avoid Zone 5 access road until further notice from BDRRMC.',                    'Web',       'Admin', 198,  NOW() - INTERVAL '3 hours'),
  ('Advisory', 'All Zones','STORM ADVISORY: Prepare emergency kits. Strong winds and heavy rain expected within the next 12 hours. Stay indoors when possible.',       'Web',       'Admin', 1284, NOW() - INTERVAL '5 hours'),
  ('Resolved', 'Zone 2',   'ALL CLEAR Zone 2: Flooding has subsided. Residents may return home. Monitor for further updates from BDRRMC.',                             'Web + SMS', 'Admin', 245,  NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

INSERT INTO public.residents (name, zone, address, household_members, contact, evacuation_status, vulnerability_tags) VALUES
  ('Juan dela Cruz',    'Zone 3', 'Purok 4, Block 2',  4, '09171234567', 'Evacuated',   ARRAY['Senior Citizen']),
  ('Maria Santos',      'Zone 5', 'Purok 7, Hillside', 6, '09182345678', 'Evacuated',   ARRAY['Pregnant','Infant']),
  ('Pedro Reyes',       'Zone 1', 'Purok 2, Block 5',  3, '09193456789', 'Safe',        ARRAY[]::TEXT[]),
  ('Ana Lim',           'Zone 6', 'Coastal Purok 8',   2, '09204567890', 'Unaccounted', ARRAY['PWD']),
  ('Carlos Bautista',   'Zone 2', 'Purok 1, Main Rd',  5, '09215678901', 'Safe',        ARRAY[]::TEXT[]),
  ('Rosa Fernandez',    'Zone 3', 'Purok 4, Block 1',  7, '09226789012', 'Evacuated',   ARRAY['Senior Citizen','Bedridden']),
  ('Jose Aquino',       'Zone 4', 'Purok 6, Block 3',  3, '09237890123', 'Safe',        ARRAY[]::TEXT[]),
  ('Luz Villanueva',    'Zone 5', 'Purok 8, Hillside', 4, '09248901234', 'Evacuated',   ARRAY['Infant'])
ON CONFLICT DO NOTHING;
