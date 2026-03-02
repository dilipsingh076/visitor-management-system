-- ============================================================
-- VMS Database Schema for Supabase (PostgreSQL)
-- Matches backend models: Society, Building, User, Visitor, Visit,
-- ConsentLog, Blacklist, Notification, AuditLog.
-- Run in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Visit status: stored as VARCHAR(20) to match backend VisitStatusType
-- (pending, approved, checked_in, checked_out, cancelled)

-- ----------------------------------------------------------------
-- 1. Societies
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  registration_number VARCHAR(100),
  society_type VARCHAR(100),
  registration_year VARCHAR(10),
  documents_note VARCHAR(500),
  plan VARCHAR(50) DEFAULT 'basic',
  status VARCHAR(50) DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_societies_slug ON societies(slug);
CREATE INDEX IF NOT EXISTS idx_societies_contact_email ON societies(contact_email);
CREATE INDEX IF NOT EXISTS idx_societies_city ON societies(city);
CREATE INDEX IF NOT EXISTS idx_societies_registration_number ON societies(registration_number);

-- ----------------------------------------------------------------
-- 2. Buildings (within a society)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buildings_society_id ON buildings(society_id);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);
CREATE INDEX IF NOT EXISTS idx_buildings_code ON buildings(code);

-- ----------------------------------------------------------------
-- 3. Users (residents, guards, admins)
-- Email is unique globally for login.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  keycloak_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  flat_number VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  role VARCHAR(50) NOT NULL DEFAULT 'resident',
  extra_data JSONB,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_society_id ON users(society_id);
CREATE INDEX IF NOT EXISTS idx_users_building_id ON users(building_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ----------------------------------------------------------------
-- 4. Visitors (no society_id; scoping is via host’s society)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  id_proof_type VARCHAR(50),
  id_proof_number VARCHAR(255),
  id_proof_image_url VARCHAR(500),
  photo_url VARCHAR(500),
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  extra_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_phone ON visitors(phone);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);

-- ----------------------------------------------------------------
-- 5. Visits (scoping via host.society_id in app logic)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  purpose VARCHAR(255),
  expected_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  qr_code VARCHAR(255) UNIQUE,
  otp VARCHAR(6),
  otp_expires_at TIMESTAMPTZ,
  checkin_photo_url VARCHAR(500),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  extra_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_host_id ON visits(host_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_qr_code ON visits(qr_code);
CREATE INDEX IF NOT EXISTS idx_visits_otp ON visits(otp);

-- ----------------------------------------------------------------
-- 6. Consent logs (DPDP compliance)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_text TEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_visit_id ON consent_logs(visit_id);

-- ----------------------------------------------------------------
-- 7. Blacklist (per society; society_id nullable for legacy)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  blacklisted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blacklist_society_id ON blacklist(society_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_visitor_id ON blacklist(visitor_id);

-- ----------------------------------------------------------------
-- 8. Notifications (per user; no society_id in model)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  extra_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ----------------------------------------------------------------
-- 9. Audit logs (no society_id in model)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_method VARCHAR(10),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ----------------------------------------------------------------
-- Optional: Demo society and building (for Table Editor / testing)
-- ----------------------------------------------------------------
INSERT INTO societies (id, slug, name, contact_email, country, plan, status)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  'demo-society',
  'Demo Society',
  'admin@demosociety.local',
  'India',
  'basic',
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO buildings (id, society_id, name, code, sort_order, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000101'::uuid,
  '00000000-0000-0000-0000-000000000100'::uuid,
  'Tower A',
  'A',
  0,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Migration from old schema (run only if you already have the old tables)
-- ----------------------------------------------------------------
-- Uncomment and run the block below to add new columns/tables without
-- dropping data. Then consider dropping redundant columns (e.g. society_id
-- from visitors/visits/notifications/audit_logs) only after updating app code.

/*
-- Add new society columns if missing
ALTER TABLE societies ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);
ALTER TABLE societies ADD COLUMN IF NOT EXISTS society_type VARCHAR(100);
ALTER TABLE societies ADD COLUMN IF NOT EXISTS registration_year VARCHAR(10);
ALTER TABLE societies ADD COLUMN IF NOT EXISTS documents_note VARCHAR(500);
ALTER TABLE societies ADD COLUMN IF NOT EXISTS address VARCHAR(500);
-- Create buildings table if missing (run the buildings CREATE TABLE from above first)
-- Add building_id to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES buildings(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_building_id ON users(building_id);
-- Make email globally unique if you had UNIQUE(society_id, email): drop that and add UNIQUE(email)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_society_id_email_key;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
*/

-- Done. Use Supabase Table Editor to inspect tables.
