# STATUS

Root tracking entrypoint for Codex sessions.
Canonical docs folder remains `docs/99-tracking/`; keep this file aligned with `docs/99-tracking/STATUS.md` when updating status.

## Project
Virtual Try-On for Salla

## Current Phase
Phase 0 - Project Setup & Infrastructure

## Current Task
Create and lock the repository governance layer before starting implementation.

## Overall Status
Not started in code yet.
Project docs exist.
Execution docs are loaded.
Governance layer is in place.

## Done
- Product requirements document prepared
- Execution plan prepared
- Project master plan prepared
- ERD prepared
- Governance skill prepared
- Initial architecture direction locked
- Canonical docs structure defined
- Root status and handoff entrypoints added

## In Progress
- Establishing Codex continuity entrypoints at repository root
- Locking implementation boundaries for Phase 0

## Next Recommended Task
Initialize the monorepo and create the base repository structure:

- `apps/api`
- `apps/dashboard`
- `apps/widget`
- `supabase/migrations`
- `packages/shared-types`

Then implement:

- root `package.json`
- `.gitignore`
- `.env.example`

## Blockers
- No implementation code scaffold yet
- Final production secrets not configured yet
- Salla partner app credentials not added yet
- Supabase production project not connected yet
- Bunny production zone not configured yet
- Replicate production token not configured yet

## Canonical Implementation Direction
- Use React 19 dashboard
- Use Express 5 backend
- Use Supabase JS client directly
- Use Replicate for AI
- Use Bunny for storage/CDN
- Use vanilla JS storefront widget
- Use `merchant_id` as tenant identity
- Keep AI processing async

## Notes
- `GET /api/auth/me` is the canonical self endpoint for the current repo direction
- If legacy references to `/api/merchants/me` appear, treat them as old references unless explicitly required
