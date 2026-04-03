# HANDOFF

Root handoff entrypoint for Codex sessions.
Canonical docs folder remains `docs/99-tracking/`; keep this file aligned with `docs/99-tracking/HANDOFF.md` when updating handoff notes.

## Project
Virtual Try-On for Salla

## Current State
The repository is still in governance and setup mode.
Core planning and architecture documents already exist.
Repository-level execution control files are now discoverable from the project root.

## Latest Completed Work
- Defined `AGENTS.md`
- Defined `README.md`
- Defined `docs/02-architecture/salla-virtual-tryon-decision-pack.md`
- Defined `docs/99-tracking/STATUS.md`
- Defined `docs/99-tracking/DECISIONS_LOG.md`
- Defined `docs/99-tracking/HANDOFF.md`
- Added root `STATUS.md`
- Added root `HANDOFF.md`

## Canonical Direction
- React 19 dashboard
- Express 5 API
- Supabase direct client, no ORM
- Replicate AI
- Bunny storage/CDN
- Vanilla JS IIFE widget
- `merchant_id` as tenant identity
- async AI jobs only
- credit-based consumption model
- Salla embedded auth + webhook lifecycle

## Important Decisions
- Hybrid architecture is locked
- Database-driven queue is locked for MVP
- `GET /api/auth/me` is the canonical self endpoint
- Governance docs must be read before every non-trivial task

## Suggested Immediate Next Task
Phase 0 - Project Setup & Infrastructure

Implement only:
1. root monorepo structure
2. root `package.json` with workspaces
3. root `.gitignore`
4. root `.env.example`
5. empty app folders:
   - `apps/api`
   - `apps/dashboard`
   - `apps/widget`
   - `supabase/migrations`
   - `packages/shared-types`

Do not implement business logic yet.

## After That
Next step:
- bootstrap `apps/api`
- create `/health`
- configure env loader
- configure Supabase client
- configure middleware skeleton

Then:
- bootstrap `apps/dashboard`
- React 19 + Vite
- Tailwind 4
- shadcn/ui
- RTL baseline
- Zustand
- router shell

## Open Blockers
- real secrets not set
- Salla app credentials not added
- Supabase project connection not added
- Bunny production zone not added
- Replicate token not added

## Run Guidance for the Next Session
Before coding:
1. read `AGENTS.md`
2. read all docs under `docs/`
3. check `STATUS.md`
4. check `DECISIONS_LOG.md`
5. continue from the suggested immediate next task

## Safety Notes
Do not:
- invent new architecture
- change stack
- use email as tenant identity
- process AI jobs synchronously
- skip webhook verification
- skip idempotency
- skip atomic credit handling
