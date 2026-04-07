# LeadPulse — Tasks

## Current Phase: POLISH (All phases complete, deployed to Vercel)

---

## Phase 1: Foundation

**Goal:** Scaffold, database, auth, and app shell. Everything needed before any feature code.

- [ ] **1.1** Project scaffold: `create-next-app` with TypeScript, Tailwind, App Router
- [ ] **1.2** Install shadcn/ui CLI + init. Install primitives: table, sheet, badge, button, input, select, dialog, textarea, popover, calendar, toast (sonner), dropdown-menu, skeleton, separator
- [ ] **1.3** Create Supabase project. Configure env vars (`.env.local` + `.env.example`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OWNER_USER_ID`
  - `FACEBOOK_VERIFY_TOKEN`
- [ ] **1.4** Database migration: `supabase/migrations/001_initial_schema.sql`
  - leads table (all fields per spec)
  - activities table
  - ingestion_events table
  - RLS policies (all three tables)
  - updated_at trigger on leads
  - **Done when:** Tables visible in Supabase dashboard, RLS active
- [ ] **1.5** Supabase client setup
  - `lib/supabase/client.ts` — browser client (anon key)
  - `lib/supabase/server.ts` — server client (cookies-based auth)
  - `lib/supabase/service.ts` — service role client (for webhook)
  - `lib/supabase/auth.ts` — auth helpers (signIn, signOut, getUser)
  - **Done when:** Can create server/client/service clients without errors
- [ ] **1.6** Shared types and enums: `lib/db/types.ts`
  - Const arrays: LEAD_STATUSES, ACTIVITY_TYPES, LEAD_SOURCES
  - TypeScript types: Lead, Activity, IngestionEvent
  - Zod schemas reuse the const arrays
  - **Done when:** Types importable and used by both schemas and queries
- [ ] **1.7** Auth middleware (`middleware.ts`)
  - Protect all routes under `(dashboard)/`
  - Exclude `/api/webhooks/*` from auth
  - Redirect unauthenticated users to `/login`
  - **Done when:** Unauthenticated request to /leads redirects to /login; webhook is reachable without auth
- [ ] **1.8** Login page (`app/login/page.tsx`)
  - Email/password form using Supabase Auth
  - Error display for invalid credentials
  - Redirect to /leads on success
  - **Done when:** Can create account and log in, session persists
- [ ] **1.9** App shell (`app/(dashboard)/layout.tsx`)
  - Sidebar (Leads nav item, Import nav item, About This Project link)
  - Header (app name "LeadPulse", user email, sign out button, demo mode button placeholder)
  - Main content area
  - Responsive: sidebar collapses at tablet, hides at mobile
  - **Done when:** Shell renders on /leads, sidebar navigation works, sign out works

## Phase 2: Core Data + Ingestion

**Goal:** Types, queries, parser, webhook, seed data. All data infrastructure before UI.

- [ ] **2.1** Zod schemas: `lib/ingestion/schemas.ts`
  - `facebookWebhookSchema` — validates incoming FB payload
  - `textParseInputSchema` — validates raw text string
  - `parsedLeadSchema` — validates parsed lead data before insert
  - **Done when:** Schemas validate sample payloads, reject malformed input
- [ ] **2.2** Supabase query functions: `lib/supabase/queries/leads.ts`
  - `getLeads(filters, sort)` — filtered/sorted lead list
  - `getLeadById(id)` — single lead with activities
  - `createLead(data)` — insert new lead
  - `updateLead(id, fields)` — partial update
  - `getLeadStats()` — aggregated counts/values for dashboard strip
  - **Done when:** All queries work against Supabase with correct RLS behavior
- [ ] **2.3** Supabase query functions: `lib/supabase/queries/activities.ts`
  - `getActivitiesByLeadId(leadId)` — chronological, newest first
  - `createActivity(data)` — insert activity
  - **Done when:** Can create and fetch activities for a lead
- [ ] **2.4** Text notification parser: `lib/ingestion/parser.ts`
  - Line-by-line key-value parser per spec
  - Handles: "City and State" split, "None" → null, missing fields, extra whitespace
  - Returns typed ParsedLead or error
  - **Done when:** Parses all 3 sample texts from Tony's screenshot correctly
- [ ] **2.5** Parser tests (manual or script)
  - Test with 3 real FB notification formats from screenshot
  - Test edge cases: missing email, "None" message, extra whitespace, unknown keys
  - **Done when:** All test cases pass
- [ ] **2.6** Facebook webhook endpoint: `app/api/webhooks/fb/route.ts`
  - GET handler: verify `hub.verify_token` against env var, return `hub.challenge`
  - POST handler: Zod validate → service role client → create ingestion_event + lead
  - Uses `OWNER_USER_ID` for user_id on created records
  - Returns 200 on success, 400 on validation failure
  - **Done when:** GET returns challenge; POST with test payload creates a lead in Supabase
- [ ] **2.7** Text paste endpoint: `app/api/intake/parse/route.ts`
  - Auth-protected (uses session user_id)
  - Accepts raw text body → parser → create ingestion_event + lead
  - Returns created lead or parse errors
  - **Done when:** Pasting FB notification text via API creates a lead
- [ ] **2.8** Server Actions: `lib/actions/leads.ts`
  - `updateLeadStatus(leadId, status)` — with revalidatePath
  - `updateLeadFields(leadId, fields)` — partial update with revalidatePath
  - **Done when:** Actions callable from client components, data updates and page refreshes
- [ ] **2.9** Server Actions: `lib/actions/activities.ts`
  - `createActivity(leadId, type, content?)` — with revalidatePath
  - **Done when:** Action creates activity and refreshes activity list
- [ ] **2.10** Seed data: `supabase/seed.sql` or `scripts/seed.ts`
  - 8-10 realistic leads using real FB notification field patterns
  - Mix of statuses: 2 New, 2 Contacted, 1 No Response, 2 Proposal, 1 Won, 1 Lost
  - 15-20 activities spread across leads (calls, texts, proposals, notes)
  - Realistic names, phone numbers, cities, job types, service types
  - Some leads with quotes/sqft, some without
  - **Done when:** Running seed populates Supabase with believable data
- [ ] **2.11** Excel parser: `lib/ingestion/excel-parser.ts`
  - Accepts 2D array (rows from parsed .xlsx)
  - First row = headers, matched case-insensitively to lead field names
  - Handles: "City and State" split, "Phone"/"Number" aliases, unknown columns ignored
  - Skips rows where name is empty
  - Returns `{ leads: ParsedLead[], errors: { row: number, message: string }[] }`
  - Reuses `parsedLeadSchema` from `lib/ingestion/schemas.ts`
  - **Done when:** Parses sample .xlsx data with correct/incorrect rows, returns expected results
- [ ] **2.12** Excel intake endpoint: `app/api/intake/excel/route.ts`
  - Auth-protected (uses session user_id)
  - Accepts multipart/form-data with single .xlsx file
  - Server-side parsing with `xlsx` (SheetJS) library
  - Calls excel parser → bulk creates leads + ingestion_events
  - Returns `{ created: number, errors: { row: number, message: string }[] }`
  - **Done when:** Uploading a .xlsx via API creates leads in Supabase, returns correct counts/errors

## Phase 3: Lead Management UI (the representative view)

**Goal:** Build the main lead list — this is the most representative view and establishes the component vocabulary.

- [ ] **3.1** Lead list page: `app/(dashboard)/leads/page.tsx`
  - Server component: fetches leads with default sort (newest first)
  - Renders DashboardStrip + LeadFilters + LeadTable
  - **Done when:** Page loads and shows seeded leads
- [ ] **3.2** Dashboard summary strip: `components/leads/dashboard-strip.tsx`
  - KPI cards: total leads, by-status counts, pipeline value (sum of quotes for Proposal status), avg time-to-first-contact
  - Horizontal row above the table
  - **Done when:** Strip shows accurate computed values from seeded data
- [ ] **3.3** Lead table: `components/leads/lead-table.tsx`
  - Columns: name, phone, city/state, source, status (badge), urgency, follow-up date, created
  - Click row → opens detail drawer
  - **Done when:** Table renders with all columns, rows are clickable
- [ ] **3.4** Status badge + inline dropdown: `components/leads/lead-status-badge.tsx`
  - Color-coded badge per design.md
  - Click badge → dropdown with all statuses → select → Server Action → saves
  - **Done when:** Clicking a badge opens dropdown, selecting a status updates the lead
- [ ] **3.5** Urgency badge: `components/leads/lead-urgency-badge.tsx`
  - Computed from lead.created_at for leads with status "new"
  - Green (<1hr), Yellow (1-4hr), Red (>4hr)
  - Only shown for "new" status leads
  - **Done when:** New leads show time-based colored badges, other statuses show nothing
- [ ] **3.6** Lead filters: `components/leads/lead-filters.tsx`
  - Client component with filter state
  - Dropdowns: status (multi-select or single), source
  - Date filter: follow-up date range (optional, simpler approach: "overdue" / "today" / "this week" / "all")
  - Updates URL search params for server-side filtering
  - **Done when:** Selecting filters updates the table. Clearing filters restores full list.
- [ ] **3.7** Sorting
  - Column header clicks toggle sort direction
  - Sortable columns: name, created_at, follow_up_date, status
  - Default: created_at descending (newest first)
  - **Done when:** Clicking column headers sorts the table
- [ ] **3.8** Empty states
  - Generic: "No leads yet — leads will appear here when they arrive via Facebook or manual entry" + intake CTA
  - Filter: "No leads match these filters" + clear filters button
  - **Done when:** Both empty states render correctly in their respective contexts

## Phase 4: Lead Detail + Activity

**Goal:** Detail drawer with editable fields and activity log. Completes the core workflow.

- [ ] **4.1** Lead detail drawer: `components/leads/lead-detail-drawer.tsx`
  - Sheet component, opens from right (~480px)
  - Shows all lead fields
  - Sections: Lead Info (read-only intake fields), Status, Commercial (editable: sqft, quote, follow-up date), Notes, Activity Log
  - **Done when:** Clicking a table row opens the drawer with correct lead data
- [ ] **4.2** Editable fields in drawer
  - Estimated sqft (number input)
  - Quote amount (number input, formatted as currency)
  - Notes (textarea)
  - Follow-up date (date picker)
  - Status selector
  - Save via Server Actions on blur/change or explicit save button
  - **Done when:** Editing a field and saving updates the database and reflects in the table
- [ ] **4.3** Activity timeline: `components/activity/activity-timeline.tsx`
  - Chronological list, newest first
  - Each entry: type icon/badge, content, timestamp
  - Compact layout (no cards, just a vertical line + entries)
  - **Done when:** Activities display correctly in the drawer for seeded data
- [ ] **4.4** Activity entry form: `components/activity/activity-entry-form.tsx`
  - Type dropdown (from ACTIVITY_TYPES const)
  - Optional note textarea
  - Submit button → Server Action
  - Form clears after submit
  - **Done when:** Adding an activity appears in the timeline immediately
- [ ] **4.5** Text paste intake form: `components/leads/lead-intake-form.tsx`
  - Textarea for pasting FB notification text
  - Parse button → calls /api/intake/parse → shows preview → confirm to save
  - Error display for unparseable text
  - Accessible from header ("+ New Lead" button) or empty state CTA
  - **Done when:** Pasting real FB notification text creates a lead that appears in the table
- [ ] **4.6** Manual lead creation fallback
  - Simple form with name (required) + optional fields
  - For cases where paste doesn't work or lead comes from a different source
  - Source: "manual"
  - **Done when:** Can create a lead with just a name via form
- [ ] **4.7** Excel import page: `app/(dashboard)/import/page.tsx` + `components/import/excel-upload-form.tsx`
  - File drop zone / file picker (accepts .xlsx, .xls)
  - "Download Template" link with sample .xlsx (correct headers + 1-2 example rows)
  - Upload → call /api/intake/excel → show results (X created, Y skipped with per-row errors)
  - CTA to navigate to lead list after import
  - **Done when:** Uploading a .xlsx from the import page creates leads and shows results

## Phase 5: Real-Time + Delight

**Goal:** Live notifications and demo mode. The "wow" layer.

- [ ] **5.1** Supabase real-time subscription
  - Client-side subscription to leads table INSERT events
  - Triggers on new leads matching the user's user_id
  - On event: refetch lead list + trigger toast
  - **Done when:** Creating a lead via webhook causes the table to update without manual refresh
- [ ] **5.2** Toast notification on new lead
  - Appears top-right: "New lead: {name} from {city}"
  - Uses sonner (shadcn toast)
  - Auto-dismiss after 5 seconds
  - **Done when:** New lead via webhook → toast appears → table updates
- [ ] **5.3** Demo mode button
  - In header: "Simulate Lead" button (or icon + label)
  - Calls /api/demo/simulate → creates a realistic randomized lead
  - Triggers the full pipeline: webhook handler → lead created → real-time → toast
  - Generates varied data: random names, cities, job types, service types
  - **Done when:** Clicking the button creates a new lead with toast notification
- [ ] **5.4** Demo data generator: `lib/ingestion/demo-data.ts`
  - Pool of realistic names, cities/states, job types, service types
  - Generates randomized FB notification payload format
  - **Done when:** Generates varied, realistic-looking lead data each time

## Phase 6: About + Polish

**Goal:** Reviewer surface, responsive pass, UI state polish.

- [x] **6.1** About This Project modal: `components/about/about-modal.tsx`
  - Content: what it is, problem it solves, target user, what's in v1, what's deferred, how it works, architecture, what it demonstrates
  - Triggered from sidebar nav link
  - Responsive, scrollable
- [x] **6.2** Responsive layout pass
  - Mobile sidebar as Sheet overlay with hamburger toggle (DashboardShell client wrapper)
  - Table columns hide progressively: mobile (name, status, urgency), tablet adds (created, location), desktop shows all
  - Filters stack full-width on mobile, pagination hides page numbers on small screens
  - Intake form grid stacks to single column, drawer already full-width on mobile
- [x] **6.3** Loading states
  - Table skeleton (responsive, matches visible columns)
  - Dashboard strip skeleton (6 skeleton cards matching grid)
  - Activity timeline skeleton in drawer (3 placeholder items)
  - All button loading states verified
- [x] **6.4** Error states
  - Dashboard error boundary (`app/(dashboard)/error.tsx`)
  - Leads page error boundary (`app/(dashboard)/leads/error.tsx`)
  - Activity fetch error with retry in drawer
  - Status badge update toast.error on failure
- [x] **6.5** Polish pass
  - Console clean (no stray logs, build clean)
  - All interactive elements have hover/focus states
  - Global focus outline via outline-ring/50
  - Color contrast passes WCAG AA (foreground on card: ~9.3:1, muted on card: ~5.4:1)
- [x] **6.6** README final pass
  - Updated feature list, env vars section, accurate instructions
- [x] **6.7** GitHub repo setup + Vercel deploy
  - Repo public at github.com/tqny/leadpulse
  - Env vars configured via Vercel CLI
  - Production deploy at leadpulse-one.vercel.app

---

## Completed

- [x] Phase 1: Foundation (1.1-1.9) — scaffold, shadcn/ui, Supabase clients, auth, login, app shell
- [x] Phase 2: Core Data + Ingestion (2.1-2.12) — schemas, queries, parser, Excel parser, webhook, endpoints, Server Actions, seed data
- [x] Phase 3: Lead Management UI (3.1-3.8) — dashboard strip, lead table, status/urgency badges, filters, sorting, empty states
- [x] Phase 4: Lead Detail + Activity (4.1-4.7) — detail drawer, editable fields, activity timeline/form, text paste, manual entry, Excel import page
- [x] Phase 5: Real-Time + Delight (5.1-5.4) — Supabase realtime subscription, toast notifications, demo simulate button
- [x] Phase 6 (6.1-6.7): About modal, responsive layout, loading/error states, polish, README, Vercel deploy
- [x] Post-phase polish: hover animations, status-colored KPI cards, editable contact fields, filter UX, Epoxy Bros branding

---

## Notes

- Build Phase 3 (Lead List) as the representative view first — it establishes the component vocabulary for everything else
- Seed data should use the real FB notification field patterns from Tony's screenshot
- Parser should handle the "City and State: {city} and {state}" format specifically
- Demo mode calls the webhook handler function directly, not via HTTP (avoids localhost issues on Vercel)
- Real-time subscription uses Supabase Realtime on the leads table, filtered by user_id via RLS
- Server Actions use revalidatePath('/leads') to refresh the page data after mutations
