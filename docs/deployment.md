# Deployment

## Local development

- Backend: `cd backend && npm install && npm run dev`
- Frontend: served from Express on `http://localhost:3001`

## Production hints

- Frontend can be deployed on Vercel or a static host
- Backend can run on Render or a Node host
- Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SESSION_SECRET`
- Keep secrets out of source control and screenshots
