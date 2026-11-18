# Database design

The project uses a Supabase PostgreSQL schema for production and a local in-memory store for local development when credentials are unavailable.

## Core tables

- `profiles`
- `decisions`
- `decision_models`
- `model_variables`
- `scenarios`
- `simulations`
- `simulation_results`
- `decision_journal`
- `reports`
- `subscriptions`

## Security

Tiered row-level security should be enabled in Supabase so a user may only access their own records.

`database/seed.sql` contains synthetic profile examples for local demos. It does not create accounts or passwords; authentication credentials are managed by Supabase Auth.
