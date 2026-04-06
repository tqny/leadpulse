# LeadPulse

A lightweight lead intake and follow-up CRM for a small epoxy flooring contractor, built around real inbound lead workflows from Facebook ads.

## What It Is

LeadPulse is a focused operational tool that helps a solo contractor capture, triage, and track leads from Facebook Lead Ads. Leads arrive automatically via webhook, get parsed into structured records, and flow into a fast table-based interface for status tracking, outreach logging, and follow-up management.

This is not a generic CRM. It's a purpose-built lead ops tool for a specific business: a small home services company running paid Facebook campaigns and losing leads to fragmented communication.

## Why It Exists

Small contractors run on inbound leads. Facebook Lead Ads generate prospects fast — but without a system, those leads live in scattered text messages, missed callbacks, and forgotten follow-ups. Every missed response is a missed job.

LeadPulse solves one problem well: **capture every lead, respond fast, track every touchpoint, never lose a prospect.**

## What's in v1

- **Automatic lead intake** from Facebook Lead Ads via webhook
- **Text-paste parser** — copy a Facebook notification, paste it, and LeadPulse creates a structured lead record
- **Lead table** with status filtering, sorting, and urgency indicators
- **Lead detail panel** with editable fields (sqft estimate, quote amount, notes, follow-up date)
- **Activity log** per lead (calls, texts, proposals, follow-ups)
- **Dashboard summary strip** — pipeline health at a glance
- **Speed-to-lead timer** — visual urgency for uncontacted leads
- **Real-time notifications** — toast alerts when new leads arrive
- **Demo mode** — one-click lead simulation for reviewers

## What's Intentionally Not Built

- Multi-source intake (Yelp, LSA, Thumbtack) — deferred to v2
- Job/project management, scheduling, invoicing
- Automated outreach sequences
- Advanced analytics or reporting
- Multi-user roles or team features

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Deployment | Vercel |

## Architecture

```
Facebook Lead Ad → Webhook → Parse + Validate → Lead Record → UI
Text Notification → Paste → Parse + Validate → Lead Record → UI
```

Three layers: **Ingestion** (webhook + parser API routes), **Data Access** (typed Supabase queries with RLS), **UI** (table + detail drawer + activity log).

## Running Locally

```bash
# Clone
git clone https://github.com/tqny/leadpulse.git
cd leadpulse

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in Supabase URL and anon key

# Dev
npm run dev
```

## What This Demonstrates

- **Product thinking:** Identifying a specific workflow problem and scoping a focused solution
- **Integration design:** Real webhook handling, structured text parsing, raw payload traceability
- **Data modeling:** Relational schema with proper state machine, activity tracking, RLS
- **UI craft:** Fast triage interface with urgency indicators, inline status updates, real-time notifications
- **Scope discipline:** Clear MVP boundaries, explicit non-goals, no feature creep

## Project Docs

- `docs/spec.md` — Product specification
- `docs/architecture.md` — Technical architecture
- `docs/tasks.md` — Task breakdown and status
- `docs/design.md` — Design system

---

Built by [Tony Mikityuk](https://tqny.github.io/Tony-s-Site/) as a portfolio artifact demonstrating product and engineering judgment.
