# LeadPulse — Design System

## Pass 1: Structure + Direction

### Layout Pattern

**Sidebar + header + main content area.**

- Sidebar: narrow (64px collapsed / 240px expanded), navigation only
  - Leads (primary)
  - About This Project
- Header: app name, user context, demo mode button
- Main content: lead table fills the area
- Detail view: slide-out drawer from right (Sheet component), ~480px wide

### Information Density

Moderately dense. This is a daily work tool — the user wants to scan fast and act fast.

- Lead table: 7-8 visible columns on desktop
- Detail drawer: all fields visible in one scroll
- Activity log: compact timeline, no cards
- Dashboard strip: 4-5 KPI cards in a horizontal row above the table

### Visual Tone

Professional, utilitarian, clean. Not flashy, not startup-y. Think "ops dashboard for someone between job sites."

- Light mode only (differentiates from The Barter's dark editorial aesthetic; shows portfolio range)
- Neutral base with functional color accents
- No decorative elements — every visual element earns its place
- Clean borders, subtle shadows, tight spacing

### Color System

**Base:**
- Background: white / slate-50
- Surface: white (cards, drawers)
- Border: slate-200
- Text primary: slate-900
- Text secondary: slate-500

**Status Colors (functional, not decorative):**

| Status | Color | Tailwind | Hex |
|--------|-------|----------|-----|
| New | Blue | blue-500 | #3b82f6 |
| Contacted | Teal | teal-500 | #14b8a6 |
| No Response | Amber | amber-500 | #f59e0b |
| Proposal | Purple | purple-500 | #8b5cf6 |
| Won | Green | green-500 | #22c55e |
| Lost | Gray-red | slate-400 | #94a3b8 |

**Urgency Colors (response timer):**

| Threshold | Color | Tailwind |
|-----------|-------|----------|
| < 1 hour | Green | green-500 |
| 1-4 hours | Yellow | amber-500 |
| > 4 hours | Red | red-500 |

**Accent:** Blue-600 for primary action buttons / CTAs.

### Typography

- **Font:** Inter (via Google Fonts) or system font stack as fallback
- **Scale (tight):**
  - xs: 12px — metadata, timestamps
  - sm: 14px — table body, form labels
  - base: 16px — body text, drawer content
  - lg: 18px — section headers
  - xl: 20px — page titles
  - 2xl: 24px — KPI values in summary strip
- **Weight:** 400 (body), 500 (labels/headers), 600 (emphasis/KPIs)

### Spacing

- Base unit: 4px
- Component padding: 12-16px
- Section gaps: 24px
- Table row height: 48px
- Sidebar width: 240px (expanded) / 64px (collapsed)
- Drawer width: 480px

### Border Radius

- Buttons: 6px (rounded-md)
- Cards/panels: 8px (rounded-lg)
- Badges: 9999px (rounded-full)
- Inputs: 6px (rounded-md)

### Shadows

- Minimal. Drawer gets a left shadow. Cards get a subtle border instead of shadow.
- Only the drawer overlay uses a shadow for depth cue.

### Component Vocabulary (anticipated)

| Component | shadcn Primitive | Usage |
|-----------|-----------------|-------|
| Data table | Table | Lead list |
| Drawer | Sheet | Lead detail panel |
| Status badge | Badge | Status indicators on rows |
| Urgency badge | Badge (custom) | Response timer on rows |
| Dropdown | Select / DropdownMenu | Status quick-change, filters |
| Input | Input | Text fields |
| Textarea | Textarea | Notes |
| Date picker | Calendar + Popover | Follow-up date |
| Button | Button | Actions |
| Dialog | Dialog | About modal, confirmations |
| Toast | Toast (sonner) | New lead notifications |
| File upload | Input (file) + custom | Excel import drop zone |
| Skeleton | Skeleton | Loading states |

### Interaction Patterns

- **Click table row** → open detail drawer (right slide-out)
- **Inline status dropdown** on table rows for fast triage (click badge → dropdown → select)
- **Activity entry:** select type from dropdown → optional note → save button
- **Filters:** dropdown selects above the table (status, source, follow-up date range)
- **Toast:** appears top-right on new lead via real-time subscription
- **Excel import:** drop zone / file picker → upload → results screen (created/skipped counts + errors) → CTA to leads
- **Download template:** link on import page, serves sample .xlsx with correct headers
- **Demo button:** in header, triggers a simulated lead + toast

### Responsive Approach

- **Desktop (1280px+):** Full sidebar + table + drawer side-by-side possible
- **Tablet (768-1279px):** Sidebar collapses to icons. Drawer overlays content.
- **Mobile (<768px):** Sidebar hidden (hamburger menu). Table simplifies to key columns (name, status, urgency). Drawer goes full-width.

Desktop-first. Mobile is acceptable, not optimized.

---

## Pass 2: Component-Level Design

(To be populated during BUILD phase as components are implemented and patterns emerge.)
