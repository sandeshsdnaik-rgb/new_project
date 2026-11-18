# API documentation

The backend exposes a REST API for authentication, decisions, models, scenarios, simulations, and reports.

## Authentication

- `POST /api/auth/signup`: create a user account in development mode
- `POST /api/auth/login`: authenticate a user
- `GET /api/auth/profile`: fetch profile details
- `POST /api/auth/logout`: logout

## Decisions

- `POST /api/decisions`
- `GET /api/decisions`
- `GET /api/decisions/:id`
- `PATCH /api/decisions/:id`
- `DELETE /api/decisions/:id`

## Simulation

- `POST /api/simulations/run`
- `POST /api/simulations/sensitivity`
- `POST /api/simulations/monte-carlo`

## Reports

- `POST /api/reports/generate`
- `GET /api/reports/:id`

## Security notes

- Requests must include a bearer token when Supabase is configured.
- The server validates the user and checks resource ownership before mutating data.
