# WHATIF Architecture

## Overview

WHATIF is a SaaS-style decision intelligence platform with three layers:

1. Frontend: static pages for landing, auth, dashboard, decision studio, simulation lab, risk analyzer, reports.
2. Backend: Express API with auth middleware, controllers, simulation engine, AI orchestration, and resource validation.
3. Data layer: Supabase/PostgreSQL schema with local fallback mode for local development.

## Module boundaries

- UI is responsible only for display and event handling.
- Backend validates all user inputs and performs calculations.
- AI services explain results but do not alter computed outputs.
- Simulation engine owns all numeric calculations.

## Deployment guidance

- Frontend can be served by Vercel or via local Express static hosting.
- Backend runs on Render or local Node.
- Supabase provides auth, storage, and database.

## Security requirements

- Use JWT verification from Supabase when configured.
- Never trust frontend-sent `user_id` values.
- Use ownership checks on decision and report resources.
- Keep secrets in environment files.
