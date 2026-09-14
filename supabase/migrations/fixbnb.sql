-- Fix BnB Holiday Home Operations Schema
-- Run this in your Fix BnB Supabase project SQL editor

-- Profiles (users)
CREATE TYPE app_role AS ENUM ('owner', 'management', 'cleaner', 'technician');

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role app_role NOT NULL DEFAULT 'owner',
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  display_name text NOT NULL,
  community text,
  building text,
  unit text,
  owner_id uuid REFERENCES profiles(id),
  lifecycle_status text DEFAULT 'draft',
  property_type text,
  bedrooms int,
  bathrooms int,
  guest_capacity int,
  default_checkout time DEFAULT '11:00',
  default_checkin time DEFAULT '15:00',
  address_line1 text,
  address_line2 text,
  city text,
  emirate text,
  map_url text,
  parking_notes text,
  wifi_name text,
  wifi_password text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Turnovers
CREATE TYPE turnover_status AS ENUM (
  'draft', 'scheduled', 'assigned', 'acknowledged', 'arrived',
  'in_progress', 'submitted_qc', 'qc_passed', 'guest_ready', 'cancelled'
);

CREATE TABLE IF NOT EXISTS turnovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id),
  checkout_at timestamptz NOT NULL,
  next_checkin_at timestamptz NOT NULL,
  status turnover_status DEFAULT 'scheduled',
  special_instruction text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turnover_id uuid REFERENCES turnovers(id) ON DELETE CASCADE,
  cleaner_id uuid REFERENCES profiles(id),
  assigned_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  arrived_at timestamptz,
  completed_at timestamptz
);

-- Checklist results
CREATE TABLE IF NOT EXISTS checklist_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turnover_id uuid REFERENCES turnovers(id) ON DELETE CASCADE,
  zone text NOT NULL,
  task_key text NOT NULL,
  task_label text NOT NULL,
  result text DEFAULT 'pending',
  note text,
  completed_by uuid REFERENCES profiles(id),
  completed_at timestamptz,
  UNIQUE(turnover_id, task_key)
);

-- Evidence photos
CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turnover_id uuid REFERENCES turnovers(id) ON DELETE CASCADE,
  checklist_result_id uuid REFERENCES checklist_results(id),
  zone text NOT NULL,
  storage_path text NOT NULL,
  captured_by uuid REFERENCES profiles(id),
  captured_at timestamptz DEFAULT now()
);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turnover_id uuid REFERENCES turnovers(id) ON DELETE CASCADE,
  zone text,
  issue_type text NOT NULL,
  severity text DEFAULT 'minor',
  description text NOT NULL,
  status text DEFAULT 'open',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Sectors (routing)
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_code text UNIQUE NOT NULL,
  sector_name text NOT NULL,
  city_name text,
  cleaning_team_name text,
  created_at timestamptz DEFAULT now()
);

-- Property-sector assignment
CREATE TABLE IF NOT EXISTS property_sectors (
  property_id uuid REFERENCES properties(id),
  sector_id uuid REFERENCES sectors(id),
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (property_id, sector_id)
);

-- Service packages
CREATE TABLE IF NOT EXISTS service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  regular_price numeric(10,2),
  max_guests int,
  sort_order int DEFAULT 0,
  active boolean DEFAULT true
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  discount_type text DEFAULT 'percent',
  discount_value numeric(10,2) DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  active boolean DEFAULT true,
  public_badge text
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_turnovers_property ON turnovers(property_id, checkout_at DESC);
CREATE INDEX IF NOT EXISTS idx_turnovers_status ON turnovers(status);
CREATE INDEX IF NOT EXISTS idx_assignments_turnover ON assignments(turnover_id);
CREATE INDEX IF NOT EXISTS idx_assignments_cleaner ON assignments(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_issues_turnover ON issues(turnover_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(code);
CREATE INDEX IF NOT EXISTS idx_properties_lifecycle ON properties(lifecycle_status);
