# LeadPulse — Product Spec

## What It Is

LeadPulse is a lightweight lead intake and follow-up CRM for a small epoxy flooring contractor. It automatically ingests Facebook Lead Ads submissions via webhook, creates structured lead records, and gives a solo founder one place to triage leads, track outreach, and manage deal progress.

## Who It's For

**Primary user:** A solo founder or owner-operator of a small epoxy flooring company who is also the salesperson / account manager.

**Context:**
- Leads arrive from paid Facebook ads, fast and frequently
- The owner needs to respond within minutes to maximize close rate
- Today, leads get lost in texts, voicemails, and scattered notes
- They don't need a full enterprise CRM — they need a fast, focused lead tracker

## Why It Exists

Small home services businesses run on inbound leads. The current workflow is fragmented: Facebook sends a text notification, the owner reads it while on a job site, maybe calls back, maybe doesn't, and there's no system of record. Leads fall through the cracks.

LeadPulse solves this by providing:
1. **Automatic lead capture** from Facebook Lead Ads
2. **A fallback intake path** for pasting forwarded text notifications
3. **A single source of truth** for lead status, outreach history, and follow-up scheduling

## Success Criteria

A reviewer should be able to:
- Immediately understand this is a focused operational tool for a contractor, not a generic dashboard
- See leads arrive (via demo mode), get triaged, and move through a pipeline
- Understand the product wedge: Facebook Lead Ads → fast response → tracked follow-up

A user should be able to:
- Receive leads automatically from Facebook
- Create leads by pasting a forwarded text notification
- Review leads in a clean table with filters
- Update lead status quickly (inline)
- Record follow-up notes and outreach activity
- See urgency indicators for uncontacted leads
- View pipeline health at a glance (summary strip)

## MVP Scope

### Must-Haves

- Facebook Lead Ads webhook endpoint (receives, validates, stores)
- Text-paste parser intake (structured FB notification format)
- Automatic lead record creation from inbound data
- Lead list/table view with filtering and sorting
- Lead detail drawer/panel with editable fields
- Status management: New, Contacted, No Response, Proposal, Won, Lost
- Activity log per lead with manual entry
- Dashboard summary strip (status counts, pipeline value, avg response time)
- Lead response timer / urgency indicators
- Real-time toast notification on new lead arrival
- Demo mode button (simulate a lead for reviewers)
- Seed data (8-10 realistic leads at various stages)
- Supabase persistence with RLS
- Single-operator auth (Supabase Auth)
- About This Project modal
- Excel file upload intake (bulk import from .xlsx with header matching)
- Downloadable Excel template with correct headers
- Import results screen (created count, per-row errors)
- Responsive layout (desktop-first, acceptable mobile)

### Core Lead Fields

| Field | Type | Source |
|-------|------|--------|
| name | string | FB webhook / parser |
| phone | string | FB webhook / parser |
| email | string (optional) | FB webhook / parser |
| city | string | FB webhook / parser |
| state | string | FB webhook / parser |
| job_type | string | FB webhook / parser |
| service_type | string | FB webhook / parser |
| message | string (optional) | FB webhook / parser |
| source | enum: facebook_webhook, text_paste, manual, excel_upload | system |
| status | enum: new, contacted, no_response, proposal, won, lost | user |
| estimated_sqft | number (optional) | user |
| quote_amount | number (optional) | user |
| notes | text (optional) | user |
| follow_up_date | date (optional) | user |
| raw_payload | jsonb | system |
| created_at | timestamp | system |
| updated_at | timestamp | system |

### Activity Types

| Type | Label |
|------|-------|
| called | Called |
| left_voicemail | Left voicemail |
| texted | Texted |
| proposal_sent | Proposal sent |
| follow_up_scheduled | Follow-up scheduled |
| note | Note added |

### Status Flow

```
New → Contacted → No Response → Proposal → Won
                                          → Lost
```

Statuses are not strictly sequential — a lead can move from New directly to Proposal if the first call results in a quote request. But the typical flow follows the sequence above.

## Excel Import

**Purpose:** Bulk import leads from `.xlsx` files. Separate import page, not inline with text-paste.

**Header matching (case-insensitive):**

| Accepted Headers | Maps To |
|---|---|
| Name | name |
| Phone / Number | phone |
| Email | email |
| City | city |
| State | state |
| City and State | split on " and " → city, state |
| Job Type | job_type |
| Service Type | service_type |
| Message | message |

**Behavior:**
- First row is treated as headers
- Unknown columns are ignored
- Rows missing `name` are skipped (name is required)
- Empty cells map to null
- Results screen shows: leads created count + per-row error details for skipped rows
- A downloadable template `.xlsx` is offered with correct headers and example rows
- Source is set to `excel_upload`

## Non-Goals (v2+)

- Multi-source lead ingestion (Yelp, LSA, Thumbtack)
- Full job/project management
- Crew scheduling
- Invoicing / payment tracking
- Customer portal
- Automated SMS/email sequencing
- Proposal builder
- Production calendar
- Photo/file management
- Estimating engine
- Advanced reporting / analytics dashboards
- Multi-user collaboration with complex roles
- Dark mode
- CSV export
- Bulk operations

## Data Model

### Entities

**leads**
- Primary entity. One record per prospect.
- Created automatically by webhook or parser, or manually.
- Stores both parsed fields and raw inbound payload.

**activities**
- Per-lead activity log entries.
- Fixed type enum + optional free-text content.
- Chronological, newest-first display.

**ingestion_events**
- Raw webhook/parser payloads for traceability.
- Linked to the lead created from the event.
- Used for debugging, not displayed in UI (stored only).

### Relationships

```
leads (1) ──── (many) activities
leads (1) ──── (many) ingestion_events
```

## Auth / Access

- Single operator — one user account (email/password via Supabase Auth)
- All tables protected by RLS policies scoped to the authenticated user
- No public access to any data
- Login page as the only unauthenticated route

## Assumptions

- Lead volume is low (tens per week, not thousands)
- Supabase free tier is sufficient for MVP
- Facebook Lead Ads webhook will be built and demonstrated with test payloads; production FB app connection is a post-MVP setup step
- The text notification format from Facebook is consistent and structured (key-value per line)
- One operator uses the system — no concurrent multi-user concerns

## Constraints

- Must feel like a real tool, not a demo shell
- Low/no cost infrastructure (Supabase free, Vercel free)
- No overbuilt backend complexity
- Desktop-first, responsive second
- Accessible and readable
- Must not drift toward a full construction operations platform
