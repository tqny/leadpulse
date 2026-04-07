# AGENTS.md — LeadPulse

A portfolio project by Tony Mikityuk.
Part of the portfolio at https://tqny.github.io/Tony-s-Site/

---

## Current Phase

**POLISH**

Phases progress as: BRIEF → PLAN → BUILD → POLISH

Update this field as the project advances.

---

## What To Do Right Now

All phases complete. App is deployed at leadpulse-one.vercel.app. Repo is public at github.com/tqny/leadpulse.

Desktop app (Electron) added — runs the same Next.js app locally with native macOS features (notifications, dock badge, window state, auto-launch).

- Visual polish and UX refinements
- Bug fixes as discovered
- **Run `/review`** before creating PRs
- **Run `/browse`** for visual QA
- **Run `/ship`** when a feature branch is ready

---

## Read Order

For any thread picking up this project:

1. `AGENTS.md` (this file) — current phase and what to do
2. `docs/spec.md` — what the product is
3. `docs/architecture.md` — how it's structured
4. `docs/tasks.md` — what's done, what's next
5. `docs/design.md` — design system and direction
6. `README.md` — reviewer-facing context

---

## Source of Truth

- `docs/spec.md` — primary product truth
- `docs/tasks.md` — execution state and continuity
- `docs/architecture.md` — technical structure
- `docs/design.md` — design system and decisions
- `README.md` — reviewer-facing orientation

---

## End-of-Session Discipline

Before ending any session:

1. Update `docs/tasks.md` — mark completed tasks, note what's in progress, confirm next task.
2. Update this file's "Current Phase" if it changed.
3. If architecture or design decisions were made, update the relevant doc.
4. Note anything a new thread needs to know that isn't captured in docs.

---

## Thread Switching

When context gets heavy (30+ substantial exchanges), recommend a fresh thread. The new thread reads this file first, then follows the read order above. Docs-as-memory keeps continuity intact.

---

## Key Project Details

- **Product:** Lightweight lead intake and follow-up CRM for a small epoxy flooring contractor
- **Entry wedge:** Facebook Lead Ads automatic ingestion
- **Fallback intake:** Copy-paste text notification parser
- **Target user:** Solo founder / owner-operator acting as salesperson
- **Status flow:** New → Contacted → No Response → Proposal → Won / Lost
- **Stack:** Next.js, TypeScript, Tailwind, shadcn/ui, Supabase, Vercel, Electron (desktop)
- **Design:** Light mode, professional/utilitarian, moderately dense ops tool
- **Auth:** Single operator, Supabase Auth, email/password

## What Not to Change Casually

- Status enum values — used across UI, database, and filters
- Lead field names — shared between parser, database, and UI types
- Ingestion API route paths — webhook URL is configured in external systems
- RLS policies — security boundary

---

## Portfolio Context

This project is part of Tony Mikityuk's portfolio. It should be:

- Portfolio-grade: polished, presentable, credible
- Scoped honestly: clear MVP, clear non-goals
- Modular: clean boundaries, reusable primitives
- Documented: repo docs are durable, chat is temporary
- Reviewer-ready: includes an in-product "About This Project" modal

Target audience for the portfolio: hiring managers evaluating a program manager / customer success professional with growing AI/agentic engineering skills.

---

## Repo Workflow

- Git repo from day 1
- GitHub remote from day 1
- Feature branches for meaningful work
- PRs before merge to main
- No direct-to-main unless trivial
