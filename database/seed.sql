-- Synthetic profile data for local demos only; this does not create login credentials.
INSERT INTO profiles (id, full_name, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo User', 'demo@whatif.local'),
  ('22222222-2222-2222-2222-222222222222', 'Avery Morgan', 'avery@example.test'),
  ('33333333-3333-3333-3333-333333333333', 'Jordan Lee', 'jordan@example.test')
ON CONFLICT (email) DO NOTHING;
