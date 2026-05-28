CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_status TEXT DEFAULT 'trialing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  icp_rules JSONB DEFAULT '[]'::jsonb,
  schedule TEXT DEFAULT 'daily',
  sequence_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
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

CREATE INDEX idx_run_logs_customer ON run_logs(customer_id, started_at DESC);
CREATE INDEX idx_integrations_customer ON customer_integrations(customer_id);
CREATE INDEX idx_configs_customer ON customer_configs(customer_id);
