# LeadPulse — Architecture

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js (App Router) | SSR for shell, API routes for webhooks, aligns with deployment target |
| Language | TypeScript | Type safety for lead data, activity types, status enums |
| Styling | Tailwind CSS | Utility-first, fast iteration, pairs with shadcn |
| Components | shadcn/ui | Accessible, composable, great table/form/dialog primitives |
| Database | Supabase (Postgres, free tier) | Persistent storage, RLS, auth, real-time subscriptions |
| Auth | Supabase Auth | Email/password for single operator, integrates with RLS |
| Validation | Zod | Schema validation for webhook payloads, parser input, form data |
| Deployment | Vercel (free tier) | Zero-config Next.js deploy, serverless functions for API routes |
| Desktop | Electron | Embeds Next.js standalone server, native macOS integration |

No charting library needed for MVP. Dashboard summary strip uses simple computed values, not charts.

## System Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         VERCEL / NEXT.JS                           │
│                                                                    │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐  │
│  │   INGESTION LAYER    │    │           UI LAYER               │  │
│  │                      │    │                                  │  │
│  │  /api/webhooks/fb    │    │  App Shell (sidebar + header)    │  │
│  │  /api/intake/parse   │    │    │                             │  │
│  │  /api/intake/excel   │    │    ├─ Dashboard Summary Strip    │  │
│  │  /api/demo/simulate  │    │    ├─ Import Page (Excel)        │  │
│  │                      │    │    ├─ Lead List + Filters        │  │
│  │  Zod validation      │    │    ├─ Lead Detail Drawer         │  │
│  │  Text parser util    │    │    ├─ Activity Log               │  │
│  │  Raw event storage   │    │    ├─ Text Paste Intake Form     │  │
│  └──────────┬───────────┘    │    └─ About This Project Modal   │  │
│             │                └──────────────┬───────────────────┘  │
│             │                               │                      │
│  ┌──────────▼───────────────────────────────▼──────────────────┐  │
│  │                    DATA ACCESS LAYER                         │  │
│  │                                                              │  │
│  │  Supabase client (typed)    Auth middleware                  │  │
│  │  Lead queries (CRUD)        Session management              │  │
│  │  Activity queries           RLS policies                    │  │
│  │  Ingestion event storage    Real-time subscriptions         │  │
│  └──────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────┼────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │         SUPABASE             │
                    │                              │
                    │  leads                       │
                    │  activities                  │
                    │  ingestion_events            │
                    │  auth.users (built-in)       │
                    │  RLS on all tables           │
                    └──────────────────────────────┘
```

## Data Flow

```
                    INBOUND (API Routes)
                    ════════════════════

Facebook ──GET──► /api/webhooks/fb ──► verify token → return challenge
         ──POST─► /api/webhooks/fb ──► Zod validate
                                    ──► service role client
                                    ──► Store raw → ingestion_events
                                    ──► Parse → create lead (status: new, user_id: OWNER_USER_ID)
                                    ──► Return 200

User paste ──POST──► /api/intake/parse ──► auth check (middleware)
                                        ──► Zod validate text input
                                        ──► Line-by-line key-value parse
                                        ──► Store raw → ingestion_events
                                        ──► Parse → create lead (status: new, user_id: session)
                                        ──► Return lead record

Excel ──POST──► /api/intake/excel ──► auth check (middleware)
                                    ──► Parse .xlsx (xlsx library)
                                    ──► Header matching (case-insensitive)
                                    ──► Per-row Zod validation
                                    ──► Bulk store raw → ingestion_events
                                    ──► Bulk create leads (status: new, source: excel_upload)
                                    ──► Return { created, errors[] }

Demo btn ──POST──► /api/demo/simulate ──► auth check (middleware)
                                       ──► Generate realistic test payload
                                       ──► Call webhook handler function directly
                                       ──► Return created lead


                    UI READS (Server Components)
                    ════════════════════════════

leads/page.tsx ──► Supabase server client ──► leads (filtered, sorted)
                                           ──► KPI aggregations for dashboard strip
LeadDetailDrawer ──► Supabase server client ──► lead + activities (per lead, newest first)
Client subscription ──► Supabase Realtime ──► new lead INSERT events ──► toast + refetch


                    UI WRITES (Server Actions)
                    ══════════════════════════

Status change ──► updateLeadStatus() ──► Supabase server client ──► revalidatePath
Field edit ──► updateLeadFields() ──► Supabase server client ──► revalidatePath
Activity add ──► createActivity() ──► Supabase server client ──► revalidatePath
```

## Auth Strategy

### UI routes
All routes under `(dashboard)/` are protected by `middleware.ts`. Unauthenticated requests redirect to `/login`.

### API routes
- `/api/webhooks/fb` — **PUBLIC** (excluded from auth middleware). Facebook calls this externally. Uses Supabase **service role key** to bypass RLS. Inserts leads with `OWNER_USER_ID` from env var. Verifies Facebook payloads via `FACEBOOK_VERIFY_TOKEN`.
- `/api/intake/parse` — **AUTH-PROTECTED**. Called from the UI by a logged-in user. Uses the user's session for `user_id`.
- `/api/intake/excel` — **AUTH-PROTECTED**. Called from the import page. Accepts multipart/form-data with `.xlsx` file. Parses headers, validates rows, bulk creates leads. Returns created count + per-row errors.
- `/api/demo/simulate` — **AUTH-PROTECTED**. Called from the UI. Generates a test payload and calls the webhook handler function directly (not via HTTP).

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # For webhook handler (bypasses RLS)
OWNER_USER_ID=                      # Single operator's auth.users UUID
FACEBOOK_VERIFY_TOKEN=              # Shared secret for FB webhook verification
```

## UI Mutation Strategy

UI-driven writes use **Next.js Server Actions** (not API routes):
- `lib/actions/leads.ts` — updateLeadStatus, updateLeadFields
- `lib/actions/activities.ts` — createActivity

Server Actions use the authenticated Supabase server client (respects RLS). API routes are reserved for external/ingestion endpoints only.

## Modules

### 1. Ingestion Layer

**Responsibility:** Receive inbound lead data, validate, normalize, and store.

**Boundaries:**
- Four API routes: webhook (public), parser (auth'd), excel import (auth'd), demo (auth'd)
- All routes produce the same output: a lead record + an ingestion event
- Webhook uses service role key + OWNER_USER_ID for writes
- No UI code in this layer
- Validation via Zod schemas

**Key files:**
- `app/api/webhooks/fb/route.ts` — GET (verification challenge) + POST (lead intake)
- `app/api/intake/parse/route.ts` — Text paste parser endpoint (auth-protected)
- `app/api/intake/excel/route.ts` — Excel file upload endpoint (auth-protected)
- `app/api/demo/simulate/route.ts` — Demo lead generator (auth-protected)
- `lib/ingestion/parser.ts` — Text notification parser utility
- `lib/ingestion/excel-parser.ts` — Excel header-matching parser utility
- `lib/ingestion/schemas.ts` — Zod schemas for webhook/parser payloads

### 2. Data Access Layer

**Responsibility:** All Supabase interactions. Typed queries, client setup, RLS.

**Boundaries:**
- Single Supabase client factory (server + client variants)
- Typed query functions for leads, activities, ingestion events
- No direct Supabase calls from UI components — always through this layer

**Key files:**
- `lib/supabase/client.ts` — Browser client (anon key, respects RLS)
- `lib/supabase/server.ts` — Server client for auth'd contexts (server components, Server Actions)
- `lib/supabase/service.ts` — Service role client (webhook handler only, bypasses RLS)
- `lib/supabase/queries/leads.ts` — Lead CRUD operations
- `lib/supabase/queries/activities.ts` — Activity CRUD operations
- `lib/db/types.ts` — Manual TypeScript types + shared const enum arrays
- `lib/actions/leads.ts` — Server Actions for lead mutations
- `lib/actions/activities.ts` — Server Actions for activity mutations

### 3. Auth Layer

**Responsibility:** Authentication and route protection.

**Boundaries:**
- Supabase Auth for email/password login
- Middleware for protected routes
- Login page as the only public route

**Key files:**
- `middleware.ts` — Route protection
- `app/login/page.tsx` — Login page
- `lib/supabase/auth.ts` — Auth helpers

### 4. UI Layer

**Responsibility:** All user-facing views and interactions.

**Sub-modules:**

| Component | Purpose |
|-----------|---------|
| App Shell | Sidebar nav, header, layout container |
| Dashboard Strip | KPI cards (status counts, pipeline value, avg response time) |
| Lead List | Data table, filters, sorting, urgency badges |
| Lead Detail | Drawer/panel with editable fields, status selector |
| Activity Log | Timeline display + entry form |
| Intake Form | Text paste → parse → create lead |
| Import Page | Excel upload → parse → bulk create leads |
| About Modal | Reviewer-facing project explanation |
| Toast System | Real-time new lead notifications |

**Key directories:**
- `app/(dashboard)/` — Protected layout with shell
- `app/(dashboard)/leads/` — Lead list page
- `components/leads/` — Lead-specific components
- `components/activity/` — Activity log components
- `components/import/` — Excel import components
- `components/ui/` — shadcn primitives
- `components/layout/` — Shell, sidebar, header

## Database Schema

### leads

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  phone text,
  email text,
  city text,
  state text,
  job_type text,
  service_type text,
  message text,
  source text not null check (source in ('facebook_webhook', 'text_paste', 'manual', 'excel_upload')),
  status text not null default 'new' check (status in ('new', 'contacted', 'no_response', 'proposal', 'won', 'lost')),
  estimated_sqft numeric,
  quote_amount numeric,
  notes text,
  follow_up_date date,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### activities

```sql
create table activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  type text not null check (type in ('called', 'left_voicemail', 'texted', 'proposal_sent', 'follow_up_scheduled', 'note')),
  content text,
  created_at timestamptz default now()
);
```

### ingestion_events

```sql
create table ingestion_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  user_id uuid references auth.users(id) not null,
  source text not null,
  raw_payload jsonb not null,
  parsed boolean default false,
  error text,
  created_at timestamptz default now()
);
```

### RLS Policies

All tables use the same pattern:
```sql
alter table leads enable row level security;

create policy "Users can only access their own leads"
  on leads for all
  using (auth.uid() = user_id);
```

Same pattern for activities and ingestion_events.

### Updated_at Trigger

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();
```

## Text Parser Specification

**Input format** (from Facebook Lead Ad text notifications):

```
New Epoxy Bros Meta Ad Lead
Name: {name}
Number: {phone}
Email: {email}
City and State: {city} and {state}
Job Type: {job_type}
Service Type: {service_type}
Message: {message}
```

**Parser behavior:**
1. Split input into lines
2. Skip the header line ("New Epoxy Bros Meta Ad Lead" or similar)
3. For each remaining line, split on first `: ` to get key-value pairs
4. Map keys to lead fields:
   - "Name" → name
   - "Number" → phone
   - "Email" → email
   - "City and State" → split on " and " → city, state
   - "Job Type" → job_type
   - "Service Type" → service_type
   - "Message" → message (treat "None" as null)
5. Validate with Zod schema
6. Return parsed lead data or validation errors

**Edge cases:**
- Missing fields → set to null (only name is required)
- "None" values → treat as null
- Extra whitespace → trim
- Unknown keys → ignore
- "City and State" with no " and " separator → store whole string as city, state as null

### 5. Desktop Layer (Electron)

**Responsibility:** Package the web app as a native macOS desktop application.

**Architecture:** Electron spawns the Next.js standalone server as a child process on a free port, then loads it in a BrowserWindow. All server components, server actions, middleware, and API routes work identically — zero code changes to the web app.

**Key files:**
- `electron/main.ts` — Main process: server lifecycle, window management, Supabase realtime bridge for native notifications
- `electron/preload.ts` — IPC bridge (new lead events, app version, auto-launch toggle)
- `electron/menu.ts` — macOS app menu (Edit for copy/paste, auto-launch checkbox)
- `electron/notifications.ts` — Native macOS notifications + dock badge on new leads
- `electron/window-state.ts` — Persist/restore window bounds across launches
- `electron/splash.html` — Branded loading screen during server boot
- `electron/build.mjs` — esbuild script that bundles all Electron code + deps into single files
- `electron-builder.yml` — Packaging config (macOS dmg/zip targets)

**Native features:**
- `titleBarStyle: 'hiddenInset'` — native macOS traffic light buttons
- `electron-store` — persists window state and preferences
- `Notification` API — system notifications when leads arrive (even if app is background)
- `app.dock.setBadge()` — dock badge count, cleared on focus
- `app.setLoginItemSettings()` — auto-launch on login (packaged builds only)

**Build flow:** `next build` (standalone) → `esbuild` (bundle electron/) → `electron-builder` (package .app/.dmg)

## Folder Structure

```
leadpulse/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout (shell)
│   │   ├── leads/
│   │   │   └── page.tsx              # Lead list page
│   │   └── import/
│   │       └── page.tsx              # Excel import page
│   └── api/
│       ├── webhooks/
│       │   └── fb/route.ts           # Facebook webhook
│       ├── intake/
│       │   ├── parse/route.ts        # Text paste parser
│       │   └── excel/route.ts        # Excel file upload
│       └── demo/
│           └── simulate/route.ts     # Demo lead generator
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── leads/
│   │   ├── lead-table.tsx
│   │   ├── lead-detail-drawer.tsx
│   │   ├── lead-status-badge.tsx
│   │   ├── lead-urgency-badge.tsx
│   │   ├── lead-filters.tsx
│   │   ├── lead-intake-form.tsx
│   │   └── dashboard-strip.tsx
│   ├── activity/
│   │   ├── activity-timeline.tsx
│   │   └── activity-entry-form.tsx
│   ├── import/
│   │   └── excel-upload-form.tsx
│   ├── about/
│   │   └── about-modal.tsx
│   └── ui/                           # shadcn primitives
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (anon key)
│   │   ├── server.ts                 # Server client (auth'd)
│   │   ├── service.ts                # Service role client (webhook only)
│   │   ├── auth.ts                   # Auth helpers
│   │   └── queries/
│   │       ├── leads.ts
│   │       └── activities.ts
│   ├── actions/
│   │   ├── leads.ts                  # Server Actions: updateLeadStatus, updateLeadFields
│   │   └── activities.ts             # Server Actions: createActivity
│   ├── ingestion/
│   │   ├── parser.ts
│   │   ├── excel-parser.ts
│   │   └── schemas.ts
│   ├── db/
│   │   └── types.ts                  # Manual types + shared const enum arrays
│   └── utils/
│       ├── urgency.ts                # Response timer calculations
│       └── format.ts                 # Date/currency formatting
├── electron/
│   ├── main.ts                       # Electron main process
│   ├── preload.ts                    # IPC bridge
│   ├── menu.ts                       # macOS app menu
│   ├── notifications.ts              # Native notifications + dock badge
│   ├── window-state.ts               # Window bounds persistence
│   ├── types.ts                      # Shared IPC types
│   ├── splash.html                   # Loading screen
│   └── build.mjs                     # esbuild bundler script
├── electron-builder.yml              # Desktop packaging config
├── middleware.ts                      # Auth route protection
├── docs/
│   ├── spec.md
│   ├── architecture.md
│   ├── tasks.md
│   └── design.md
├── AGENTS.md
├── README.md
└── supabase/
    └── migrations/                   # SQL migration files
        └── 001_initial_schema.sql
```

## External Dependencies

| Dependency | Purpose | Required? |
|-----------|---------|-----------|
| next | Framework | Yes |
| react / react-dom | UI | Yes |
| typescript | Language | Yes |
| tailwindcss | Styling | Yes |
| @supabase/supabase-js | Database client | Yes |
| @supabase/ssr | Server-side auth helpers | Yes |
| zod | Schema validation | Yes |
| shadcn/ui components | UI primitives (installed individually) | Yes |
| date-fns | Date formatting/calculation | Yes |
| xlsx (SheetJS) | Server-side .xlsx parsing for Excel import | Yes |
| electron | Desktop app shell (dev dep) | Desktop only |
| electron-builder | Package .app/.dmg (dev dep) | Desktop only |
| electron-store | Window state + preferences persistence | Desktop only |
| get-port-please | Find free port for embedded server | Desktop only |

## Swap Points

These are areas designed to be replaceable without affecting the rest of the system:

- **Ingestion sources:** New sources (Yelp, Thumbtack) would be new API routes that produce the same lead record output. The parser utility is isolated.
- **Database:** Supabase client is centralized in `lib/supabase/`. Swapping to another Postgres provider would only touch this directory.
- **Auth:** Auth is handled by middleware + Supabase Auth. Swapping to a different auth provider touches `middleware.ts` + `lib/supabase/auth.ts`.
- **UI components:** shadcn components are local copies, not imported from a package. They can be modified or replaced individually.
- **Deployment:** Vercel-specific code is minimal (API routes use standard Web API). Could deploy to any Node.js host.
