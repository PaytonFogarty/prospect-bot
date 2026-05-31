CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prospect_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  include_companies TEXT[] DEFAULT ARRAY[]::TEXT[],
  exclude_companies TEXT[] DEFAULT ARRAY[]::TEXT[],
  locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  industries TEXT[] DEFAULT ARRAY[]::TEXT[],
  assigned_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  run_time TEXT DEFAULT '08:00',
  prospects_per_run INTEGER DEFAULT 50,
  auto_run_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  api_key_encrypted TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, tool_name)
);

CREATE TABLE run_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  config_id UUID REFERENCES prospect_configs(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  prospects_searched INT DEFAULT 0,
  prospects_filtered INT DEFAULT 0,
  prospects_skipped_dedup INT DEFAULT 0,
  prospects_enriched INT DEFAULT 0,
  prospects_pushed INT DEFAULT 0,
  status TEXT DEFAULT 'running',
  error_message TEXT
);

CREATE TABLE pushed_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  linkedin_url TEXT,
  email TEXT,
  pushed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  prospects_checked INTEGER DEFAULT 0,
  prospects_updated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  error_message TEXT
);

CREATE INDEX idx_prospect_configs_customer ON prospect_configs(customer_id);
CREATE INDEX idx_run_logs_customer ON run_logs(customer_id, started_at DESC);
CREATE INDEX idx_integrations_customer ON customer_integrations(customer_id);
CREATE INDEX idx_pushed_customer_linkedin ON pushed_prospects(customer_id, linkedin_url);
CREATE INDEX idx_pushed_customer_email ON pushed_prospects(customer_id, email);
CREATE INDEX idx_refresh_logs_customer ON refresh_logs(customer_id, started_at DESC);
