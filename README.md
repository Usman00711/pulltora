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
