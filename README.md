# Virtual Try-On for Salla

AI-powered Virtual Try-On SaaS for Salla merchants.
This repository is currently in **Phase 7 - Storefront UX Hardening and Live Validation**.

## Project Surface Area

- **Merchant Dashboard**: External React 19 application for management and monitoring.
- **Storefront Widget**: Lightweight Vanilla JS bundle injected into Salla product pages.
- **Backend API**: Node.js/Express 5 orchestration layer for jobs, credits, and Salla integration.
- **Shared Types**: Centralized schema definition for full architecture unification.

## Source of Truth

Read these before non-trivial work:

- `AGENTS.md` (Root)
- `docs/00-governance/SKILL.md`
- `docs/01-product/prd-virtual-tryon.md`
- `docs/02-architecture/erd-virtual-tryon.md`
- `docs/99-tracking/STATUS.md`
- `docs/99-tracking/HANDOFF.md`

## Locked Stack

- **Dashboard**: React 19 + Vite + shadcn/ui + Tailwind CSS 4
- **API**: Node.js 20 + Express 5
- **Database**: Supabase PostgreSQL + Realtime
- **AI**: Replicate API (Async Predictions)
- **Storage/CDN**: Bunny.net
- **Storefront Widget**: Vanilla JS IIFE
- **Validation**: Zod
- **Image Processing**: Sharp
- **Dashboard State**: Zustand

## Workspace Layout

```txt
apps/
  api/          # Express 5 Backend
  dashboard/    # React 19 Merchant Admin
  widget/       # Vanilla JS Storefront Script
docs/           # Project Governance & Tracking
packages/
  shared-types/ # Unified Schema (Single Source of Truth)
supabase/
  migrations/   # Database Schema & Migrations
```

## Commands

Run from the repository root:

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:api
pnpm dev:dashboard
pnpm dev:widget

# Build all packages
pnpm build

# Lint and Typecheck
pnpm lint
pnpm typecheck
```

## Quick Links

- [Root Status](file:///c:/Users/ITS/Desktop/order_theme/salla-vtryon/STATUS.md)
- [Root Handoff](file:///c:/Users/ITS/Desktop/order_theme/salla-vtryon/HANDOFF.md)
- [API Health](http://localhost:3001/health)
