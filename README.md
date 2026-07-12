# Pulltora

Engineering Delivery Intelligence Dashboard for technical leads.

## Branding

Frontend brand asset and theme are set to **Pulltora**.

- Root logo source: `apps/web/public/branding/pulltora_logo.png`
- App title: `Pulltora`

### Pulltora theme tokens (authoritative source)

Theme tokens live in:
- `apps/web/src/styles.css`
- `apps/web/tailwind.config.ts`

Core palette source variables:
- `--background`: app base canvas
- `--foreground`: base text
- `--surface`, `--surface-2`: card and panel surfaces
- `--card`: content panel base
- `--border`: stroke color
- `--ring`: focus/interactive ring and hover accents
- `--primary`: brand action color
- `--accent`: secondary accent for highlights
- `--brand`, `--brand-foreground`, `--brand-glow`: primary branding signals
- `--motion-fast`, `--motion-medium`, `--motion-slow`: animation timings

## Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts + React Router + React Hook Form + Zod + TanStack Query
- Backend: NestJS + TypeScript + Mongoose (MongoDB Atlas) + JWT + Swagger/OpenAPI

## Monorepo Layout

devpulse/
  apps/
    web/
    api/
  packages/
    shared/

Run:
- `npm install --include-workspace-root --workspaces`
- `npm run dev`

## Scripts
- `npm run dev` — run frontend and backend dev servers
- `npm run build` — build all workspaces
- `npm run lint` — lint all workspaces
- `npm run test` — run all workspace tests
- `npm run typecheck` — typecheck all workspaces

## Production readiness

Production defaults are intentionally stricter than local development:

- Required backend env values are validated at startup when `NODE_ENV=production`.
- Swagger docs are hidden in production unless `ENABLE_SWAGGER=true`.
- `ALLOWED_ORIGINS` must be set to deployed frontend origins only in production.
- AI insights support deterministic rules, local Ollama, or hosted Gemini.
- Secret values are never returned by the Settings API.

Use `.env.production.example` as the deployment checklist.

## Free deployment guide

Recommended portfolio-grade free stack:

- Frontend: Vercel
- Backend: Northflank Sandbox, Koyeb, or Render as fallback
- Database: MongoDB Atlas free tier
- AI: Gemini API key
- GitHub: optional GitHub personal access token

### Backend deployment settings

Set the backend service root directory to:

```bash
devpulse
```

Build command:

```bash
npm install --include-workspace-root --workspaces && npm run build:api
```

Start command:

```bash
npm run start --workspace @devpulse/api
```

Health check path:

```bash
/api/v1/health
```

Backend production env:

```bash
NODE_ENV=production
PORT=3001
API_PREFIX=/api/v1
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
ENABLE_SWAGGER=false

MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/pulltora_prod?retryWrites=true&w=majority
MONGODB_DB_NAME=pulltora_prod

JWT_SECRET=<GENERATE_WITH_OPENSSL_RAND_BASE64_48>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

GITHUB_TOKEN=<OPTIONAL_BUT_RECOMMENDED>

AI_ENABLED=true
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
```

Generate a JWT secret locally:

```bash
openssl rand -base64 48
```

### Frontend deployment settings

Set the Vercel project root directory to:

```bash
devpulse/apps/web
```

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

Frontend production env:

```bash
VITE_API_BASE_URL=https://your-backend-domain/api/v1
```

### Deployment smoke test

After both services are deployed:

1. Open the Vercel frontend URL.
2. Register a new account.
3. Login.
4. Add a public GitHub repository.
5. Sync GitHub data.
6. Analyze the repository.
7. Refresh improvement ideas.
8. Open Settings and confirm GitHub and Gemini status show as configured.
9. Confirm no secret values are visible in the browser.
