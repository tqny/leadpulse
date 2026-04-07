# LeadPulse

A lightweight lead intake and follow-up CRM for a small epoxy flooring contractor, built around real inbound lead workflows from Facebook ads.

## What It Is

LeadPulse is a focused operational tool that helps a solo contractor capture, triage, and track leads from Facebook Lead Ads. Leads arrive automatically via webhook, get parsed into structured records, and flow into a fast table-based interface for status tracking, outreach logging, and follow-up management.

This is not a generic CRM. It's a purpose-built lead ops tool for a specific business: a small home services company running paid Facebook campaigns and losing leads to fragmented communication.

## Why It Exists

Small contractors run on inbound leads. Facebook Lead Ads generate prospects fast — but without a system, those leads live in scattered text messages, missed callbacks, and forgotten follow-ups. Every missed response is a missed job.

LeadPulse solves one problem well: **capture every lead, respond fast, track every touchpoint, never lose a prospect.**

## What's in v1

- **Facebook Lead Ads webhook endpoint** — receives, validates, and stores inbound leads automatically
- **Text-paste parser** — copy a Facebook notification, paste it, and LeadPulse creates a structured lead record
- **Excel file upload** — bulk import leads from .xlsx files with header matching and error reporting
- **Lead table** with status filtering, sorting, and urgency indicators
- **Lead detail drawer** with editable fields (sqft estimate, quote amount, notes, follow-up date)
- **Activity log** per lead (calls, texts, proposals, follow-ups)
- **Dashboard summary strip** — pipeline health at a glance
- **Speed-to-lead urgency timer** — visual urgency for uncontacted leads
- **Real-time toast notifications** — alerts when new leads arrive
- **Demo mode** — simulate a lead button for reviewers
- **About This Project modal** — in-app context for portfolio reviewers
- **Single-operator auth** — email/password login via Supabase Auth with RLS

## What's Intentionally Not Built

- Multi-source lead ingestion (Yelp, LSA, Thumbtack) — deferred to v2
- Job/project management, crew scheduling, invoicing
- Automated SMS/email sequencing
- Proposal builder or estimating engine
- Advanced reporting or analytics dashboards
- Multi-user collaboration or role-based access
- Customer portal
- Dark mode, CSV export, bulk operations

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Validation | Zod |
| Excel parsing | SheetJS (xlsx) |
| Deployment | Vercel |

## Architecture

```
Facebook Lead Ad  --> Webhook   --> Parse + Validate --> Lead Record  --> UI
Text Notification --> Paste     --> Parse + Validate --> Lead Record  --> UI
Excel File        --> Upload    --> Parse + Validate --> Lead Records --> UI
```

Three layers: **Ingestion** (webhook, parser, and Excel upload API routes), **Data Access** (typed Supabase queries with RLS), **UI** (table + detail drawer + activity log).

## Running Locally

```bash
# Clone
git clone https://github.com/tqny/leadpulse.git
cd leadpulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all required values (see Environment Variables below)

# Run the Supabase migration
# In your Supabase project SQL Editor, run: supabase/migrations/001_initial_schema.sql

# Start dev server
npm run dev
```

You will need a [Supabase](https://supabase.com) project (free tier works). Create the project, run the migration SQL to set up the schema, and copy your project URL and keys into `.env.local`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the following:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (used server-side for webhook ingestion) |
| `OWNER_USER_ID` | UUID of the single operator account (from Supabase Auth) |
| `FACEBOOK_VERIFY_TOKEN` | Token for Facebook webhook verification handshake |

## What This Demonstrates

- **Product thinking:** Identifying a specific workflow problem and scoping a focused solution
- **Integration design:** Real webhook handling, structured text parsing, Excel import, raw payload traceability
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
