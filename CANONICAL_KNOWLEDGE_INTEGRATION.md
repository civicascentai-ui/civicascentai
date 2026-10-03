# CivicAscent Canonical Knowledge Integration — Staging

Status: **staging only**. Production/main is unchanged.

## Source of truth

Supabase project: `CivicAscent RAG Phase 1 Test`

Governed repository:
- `public.canonical_entries`
- `public.canonical_variants`
- `public.canonical_sources`
- `public.canonical_reviews`
- `public.canonical_change_requests`
- `public.canonical_embeddings`

Read interfaces:
- `civic_knowledge.active_canonical`
- `civic_knowledge.rag_feed`
- `civic_knowledge.search_canonical_vector(...)`

Application endpoint:
- `canonical-query` Edge Function
- JWT verification enabled
- service-role DB access remains server-side only
- public client receives only approved public canonical records

## Website

`script.js` exposes:

`window.CivicAscentCanonical.ask(question)`

The browser must receive the Supabase anon JWT through deployment/runtime configuration as
`window.CIVICASCENT_SUPABASE_ANON_KEY`.

Never expose the Supabase service-role key in browser code.

## LiveKit voice

`voice-backend/agent.py` now contains the LiveKit function tool
`lookup_civicascent_knowledge`.

The agent is instructed to call it before answering factual CivicAscent questions about:
- identity
- programs
- pricing
- legal status
- partnerships
- availability
- policies
- security
- government status

The tool recognizes:
- `approved` — answer from canonical authority
- `verify_live` — verify current status before stating a live fact
- `fallback` — do not invent
- `unavailable` — knowledge service unavailable; do not invent

## RAG callers

Canonical records are embedded with the same `gte-small` model already used by the Phase 1
RAG environment. All 68 current records have 384-dimension embeddings.

New RAG callers should query `canonical-query` or the service-only vector RPC. Existing
legacy Phase 1 ingestion helpers remain disabled and are not silently re-enabled.

## Production gate

Do not merge to production until:
1. deployment/runtime anon key is configured,
2. LiveKit staging credentials are configured,
3. website caller test passes from the deployed staging origin,
4. LiveKit voice call test passes,
5. live-verification topics are confirmed to stop rather than hallucinate,
6. human handoff is implemented/tested,
7. Ruth Bennett — Quality & Accessibility Director clears voice/mobile/accessibility QA,
8. Naomi Grant — Security & Risk / Governance Director clears deployment security.


## Vercel staging trigger

Triggered after Vercel Git integration was repaired on 2026-10-03. Production remains on `main`; this branch is for preview validation only.
