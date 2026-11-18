# WHATIF

WHATIF is a decision intelligence platform for small businesses and entrepreneurs. The project combines an Express.js backend, plain HTML/CSS/JavaScript frontend, a safe simulation engine, and optional Supabase integration.

## Architecture

- Frontend: static HTML/CSS/JS pages under `frontend/`
- Backend: Express API under `backend/`
- Database: Supabase/PostgreSQL schema in `database/schema.sql`
- Simulation: modular engine under `backend/services/simulation/`
- Docs: architecture and deployment notes in `docs/`

## Quick start (Windows PowerShell)

1. Open PowerShell in `d:\What if`
2. `cd backend`
3. `npm install`
4. Copy `.env.example` to `.env` and fill in values
5. `npm run start`
6. Open `http://localhost:3001`

## Important notes

- If Supabase credentials are not available, the backend runs in `development` mode using local in-memory storage.
- Never commit real secrets.
- The simulation engine and AI services never execute arbitrary user JavaScript.
