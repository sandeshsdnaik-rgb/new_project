-- WHATIF PostgreSQL schema for Supabase
-- This file is intentionally safe and idempotent for local setup with the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  model_definition JSONB NOT NULL,
  assumptions JSONB DEFAULT '[]'::jsonb,
  engine_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES decision_models(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  variable_type TEXT,
  value NUMERIC,
  unit TEXT,
  minimum_value NUMERIC,
  maximum_value NUMERIC,
  distribution TEXT,
  distribution_parameters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  input_overrides JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
  model_version TEXT,
  simulation_type TEXT,
  simulation_configuration JSONB,
  random_seed INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  output_metrics JSONB,
  statistics JSONB,
  risk_results JSONB,
  sensitivity_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_type TEXT,
  content TEXT,
  actual_outcomes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  report_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT,
  status TEXT,
  billing_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_models_decision_id ON decision_models(decision_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_decision_id ON scenarios(decision_id);
CREATE INDEX IF NOT EXISTS idx_simulations_decision_id ON simulations(decision_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
