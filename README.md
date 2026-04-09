# Virtual Try-On for Salla

AI-powered Virtual Try-On SaaS for Salla merchants.

This repository follows the governance and planning documents under `docs/` and is currently scoped to **Phase 0 - Project Setup & Infrastructure** only.

## Source of truth

Read these before non-trivial work:

- `AGENTS.md`
- `docs/00-governance/SKILL.md`
- `docs/01-product/prd-virtual-tryon.md`
- `docs/02-architecture/erd-virtual-tryon.md`
- `docs/02-architecture/salla-virtual-tryon-decision-pack.md`
- `docs/03-delivery/virtual-tryon-execution-plan.md`
- `docs/03-delivery/virtual-tryon-project-plan.md`
- `docs/99-tracking/STATUS.md`
- `docs/99-tracking/DECISIONS_LOG.md`
- `docs/99-tracking/HANDOFF.md`

## Locked stack

- Dashboard: React 19 + Vite + shadcn/ui + Tailwind CSS 4
- API: Node.js 20 + Express 5
- Database: Supabase PostgreSQL + Realtime via direct Supabase JS client
- AI: Replicate API
- Storage/CDN: Bunny.net
- Storefront widget: Vanilla JS bundled as IIFE
- Validation: Zod
- Image processing: Sharp
- Dashboard state: Zustand

## Workspace layout

```txt
apps/
  api/
  dashboard/
  widget/
docs/
packages/
  shared-types/
supabase/
  migrations/
```

## Phase 0 scope

This scaffold is limited to infrastructure only:

- monorepo workspace setup
- API bootstrap with `GET /health`
- dashboard bootstrap shell
- widget bootstrap shell
- shared types package
- environment template
- Supabase migrations directory

Do not treat this scaffold as feature-complete. Salla auth, webhook handling, credit logic, AI jobs, and storefront behavior are intentionally left for later phases.

## Commands

Run from the repository root:

```bash
pnpm install
pnpm dev:api
pnpm dev:dashboard
pnpm dev:widget
pnpm build
pnpm lint
```

API health check after starting the backend:

```bash
curl http://localhost:3001/health
```

# add shadcn component
npx.cmd shadcn@latest add [component] -c apps/dashboard

# run ngrok
/c/Users/ITS/Downloads/ngrok-v3-stable-windows-amd64/ngrok.exe http 3001


pnpm dev:api


pnpm dev:dashboard


pnpm dev:widget
