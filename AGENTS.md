<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know


## 1. What this project is

CogniPath AI is an adaptive learning platform: users pick skills, AI builds
them a roadmap, they read AI-generated lessons, solve 5 daily questions in a
sandboxed code runner, and get AI-generated diagnostic feedback (concepts
used, complexity, alternative solutions). See `PROJECT_OVERVIEW.md`,
`API_DOCUMENTATION.md`, `DATABASE_SCHEMA.md`, and `FRONTEND_MODULES.md` in
the repo root for the full spec — those are the source of truth for feature
behavior. This file is the source of truth for *how to write the code*.

We are migrating a working Vite/React UI prototype (now living in
`ui_pages/`) into this Next.js app. `ui_pages/` is scratch space, not part of
the app — never import from it, never leave it referenced. Once a file is
migrated, delete it from `ui_pages/` in the same task.

---

## 2. Stack — do not introduce alternatives without being asked

- **Framework**: Next.js App Router, TypeScript strict mode
- **UI**: shadcn/ui + Tailwind CSS
- **Data**: MongoDB Atlas via Mongoose (not Prisma, not raw driver, unless
  a task explicitly says otherwise)
- **Auth**: Auth.js v5 (`next-auth@beta`) with Google provider + Mongo adapter
- **Validation**: Zod — every AI response and every external input gets
  validated before it touches the database or the client
- **AI**: Gemini (6 rotating keys) with NVIDIA as fallback, always called
  through `src/lib/ai/*`, never directly from a route or component
- **Cache / rate limiting / locks**: Upstash Redis
- **Code execution**: JDoodle sandbox via `src/lib/code-runner/*`
- **Scheduling**: Vercel Cron
- **Editor**: Monaco (`@monaco-editor/react`)
- **Icons**: lucide-react. **Charts**: recharts.

Free-tier budget is real. Don't add a new paid service, a new database, or a
new AI provider without flagging it first instead of just installing it.

---

## 3. Non-negotiable architectural rules

1. **Browser never talks to Gemini/NVIDIA/JDoodle/Mongo directly.** Every
   external call goes: Client → Next.js route handler / server action →
   internal `lib/` service → provider. API keys are read only in
   server-only files (no `NEXT_PUBLIC_` prefix on any secret, ever).
2. **AI output is untrusted input.** Any JSON coming back from
   `src/lib/ai/tasks/*` gets parsed and validated against a Zod schema
   before it is stored or rendered. On validation failure, retry once with
   the error appended to the prompt, then fail loudly (don't silently show
   broken content).
3. **Code correctness is decided by the sandbox, not the LLM.** For coding
   questions, JDoodle test results are the ground truth for `isCorrect`/
   `passed`. The AI's job is to *explain* the result (concepts, complexity,
   alternatives), never to *decide* it.
4. **Don't regenerate what's already been generated.** Lessons and practice
   questions are generated once per topic/difficulty and reused across
   users. Check the DB / Redis cache before calling an AI task. Use
   Upstash locks to prevent duplicate generation on concurrent requests
   (e.g. daily challenge creation).
5. **Mongoose schemas follow `DATABASE_SCHEMA.md`'s shape**, but embed
   where Mongo suits it (e.g. lesson sections, test cases, solution
   approaches as subdocuments) rather than mirroring every Postgres table
   as a separate collection. If a task requires deviating from that doc's
   structure, say so before doing it.
6. **Never commit secrets.** All keys live in `.env.local` (gitignored) and
   are referenced via `process.env`. If a task needs a new env var, add it
   to `.env.example` with a placeholder, not a real value.

---

## 4. File & folder conventions

- App Router routes live in `src/app/`, grouped as `(public)` (landing,
  unauthenticated) and `(app)` (behind the session check in
  `src/app/(app)/layout.tsx`).
- One route handler file per resource action:
  `src/app/api/<resource>/route.ts` for collection-level, and
  `src/app/api/<resource>/[id]/route.ts` for item-level.
- Shared UI: `src/components/common/`. Feature UI:
  `src/components/<feature>/`. Layout shell: `src/components/layout/`.
- Business logic and provider integrations live in `src/lib/`, never inline
  in a route handler beyond orchestration:
  - `src/lib/db/` — Mongoose connection + `models/`
  - `src/lib/ai/` — `router.ts`, `providers/`, `tasks/`, `prompts/`,
    `cache.ts`
  - `src/lib/code-runner/` — sandbox abstraction + `providers/`
  - `src/lib/schemas/` — Zod schemas (mirror the Mongoose models)
- Client-only UI state (theme, sidebar, search modal open/closed) lives in
  `src/providers/ui-store.ts` (Zustand). Don't put fetched server data in
  there — fetch it in the route/page that needs it.
- Types shared between client and server go in `src/types/index.ts`.

---

## 5. Coding conventions

- TypeScript strict mode; no `any` unless narrowing an untyped third-party
  response, and even then cast through a Zod `.parse()` immediately after.
- Prefer server components for data fetching; mark `"use client"` only on
  components that actually need interactivity/hooks (this includes most of
  the ported AI Studio components — check each one rather than assuming).
- Keep the AI Studio components' prop APIs and visual structure intact
  during migration — the design is already approved. Only change *how they
  get their data*, not how they look or their component boundaries, unless
  a task says to enhance a specific section.
- Every new Mongoose model gets a matching Zod schema. Every new API route
  validates its input with that schema before touching the DB.
- Use Mongo aggregation pipelines for analytics/rollup queries instead of
  pulling documents into app code and reducing in JS.
- Write small, focused route handlers. If logic exceeds ~40 lines, extract
  it into `src/lib/`.

---

## 6. Definition of done for any module task

A task isn't finished until:
1. It builds (`npm run build`) with no TypeScript errors.
2. The relevant `ui_pages/` source file(s) are deleted.
3. There's a real, non-mocked path from UI → API route → Mongo (or AI
   provider) → back to UI for whatever the task covers.
4. Secrets/config needed are added to `.env.example` (not just used ad hoc).
5. You've stated, briefly, what you migrated, what's now DB/AI-backed vs.
   still stubbed, and what the next module depends on from this one.

If a task's scope is ambiguous, prefer the interpretation that keeps AI
generation cached, code-correctness sandboxed, and secrets server-side —
those three rules override convenience every time.

<!-- END:nextjs-agent-rules -->
