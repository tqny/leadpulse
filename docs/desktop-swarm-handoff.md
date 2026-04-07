# BridgeSwarm Handoff — LeadPulse Desktop App

## Mission

Convert the LeadPulse web app (Next.js 16 + Supabase CRM, deployed on Vercel) into a **downloadable macOS desktop application** using Electron. The web app continues running on Vercel unchanged. The desktop app embeds a Next.js standalone server inside Electron so that 100% of existing server components, server actions, middleware, and API routes work without modification.

This is a daily-driver tool for a contractor — not a demo. It must feel native.

---

## Project Context

- **Repo:** `/Users/tqny/Documents/leadpulse`
- **Stack:** Next.js 16.2.2, React 19, TypeScript, Tailwind v4, shadcn/ui, Supabase
- **Live at:** leadpulse-one.vercel.app
- **Auth:** Supabase Auth (email/password), cookie-based sessions via middleware
- **Realtime:** Supabase channel subscription for new lead INSERT events (in `components/leads/realtime-leads.tsx`)
- **API routes:** 4 endpoints under `app/api/` (demo simulate, text parse, excel intake, Facebook webhook)
- **Server actions:** `lib/actions/leads.ts` and `lib/actions/activities.ts` — all use `revalidatePath("/leads")`
- **Env vars needed for desktop:** Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both already public). Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `OWNER_USER_ID`, `FACEBOOK_VERIFY_TOKEN`) are only used by the webhook route which stays on Vercel.

---

## Shared Constraints (All Agents)

1. **Do NOT modify** any existing files under `app/`, `components/`, `lib/`, or `supabase/`. The web app must remain deployable to Vercel with zero regressions.
2. Only 3 existing files get touched: `next.config.ts` (add `output: "standalone"`), `package.json` (add deps + scripts), `.gitignore` (add `dist/`, `release/`).
3. All new desktop code lives in `electron/` directory.
4. TypeScript everywhere — no raw JS in `electron/`.
5. Target: macOS (arm64 + x64 universal). Cross-platform is a future concern.
6. The app connects to the same Supabase cloud instance — no local database.

---

## Agent Assignments

### Agent 1: Build Engineer

**Role:** Project configuration, dependency management, and build pipeline.

**Tasks:**
1. Modify `next.config.ts` — add `output: "standalone"` to the existing config object. Nothing else changes.
2. Add devDependencies to `package.json`: `electron`, `electron-builder`, `electron-store`, `get-port-please`, `concurrently`, `tsx`
3. Add scripts to `package.json`:
   - `"electron:dev"` — `concurrently \"next dev\" \"tsx electron/main.ts\"` (with wait logic so Electron opens after Next.js is ready)
   - `"electron:build"` — `next build && tsx --tsconfig electron/tsconfig.json electron/build.ts && electron-builder`
   - `"electron:start"` — for testing the packaged app locally
4. Create `electron/tsconfig.json` targeting Node/ES modules, pointing at the electron/ directory only.
5. Add `dist/`, `release/`, `out/` to `.gitignore`.
6. **Verify:** Run `next build` and confirm `.next/standalone/server.js` exists. Run `npm run electron:build` end-to-end.

**Key files:**
- `next.config.ts` (modify)
- `package.json` (modify)
- `.gitignore` (modify)
- `electron/tsconfig.json` (create)

---

### Agent 2: Electron Core

**Role:** Main process — server lifecycle, window creation, app lifecycle.

**Tasks:**
1. Create `electron/main.ts` with:
   - **Server startup:** On `app.ready`, find a free port (use `get-port-please`), spawn `.next/standalone/server.js` as a child process with `PORT` env var set. In dev mode, assume `next dev` is already running on port 3000.
   - **Health check loop:** Poll `http://localhost:{port}` until the server responds (retry every 200ms, timeout at 15s). Show splash screen while waiting.
   - **Window creation:** Once server is healthy, create a `BrowserWindow` loading `http://localhost:{port}`. Options: `width: 1280`, `height: 860`, `minWidth: 900`, `minHeight: 600`, `titleBarStyle: 'hiddenInset'`, `webPreferences: { preload: preload.js }`.
   - **macOS lifecycle:** Don't quit on all windows closed (`app.on('window-all-closed')`). Recreate window on `activate` if none exist.
   - **Graceful shutdown:** On `app.on('before-quit')`, kill the child process (SIGTERM, then SIGKILL after 5s timeout). Clean up to prevent orphaned Node processes.
   - **Environment:** Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` on the child process env. Read from `.env.local` in dev, or embed at build time for production.

2. Export the `mainWindow` reference so other modules (Agent 4) can access it for IPC.

**Key files:**
- `electron/main.ts` (create)

**Depends on:** Agent 1 (tsconfig, deps installed)

---

### Agent 3: Preload & IPC Bridge

**Role:** Secure communication between main process and renderer (the Next.js app running in the BrowserWindow).

**Tasks:**
1. Create `electron/preload.ts`:
   - Use `contextBridge.exposeInMainWorld('electronAPI', { ... })` to expose:
     - `onNewLead(callback)` — listens for `'new-lead'` IPC event from main process (used for dock badge + native notification triggers)
     - `getAppVersion()` — returns `app.getVersion()`
     - `setAutoLaunch(enabled: boolean)` — sends IPC to main to toggle login item
   - Keep the surface area minimal. The renderer doesn't need filesystem access or anything beyond these signals.

2. Create `electron/types.ts` — shared TypeScript interfaces for IPC message payloads (`NewLeadPayload`, `ElectronAPI` interface for the window global).

**Key files:**
- `electron/preload.ts` (create)
- `electron/types.ts` (create)

**Depends on:** Agent 1 (deps)

---

### Agent 4: Native Integration

**Role:** macOS-native features that make this feel like a real desktop app, not a website in a frame.

**Tasks:**
1. **Window state persistence:** Use `electron-store` to save/restore window bounds (x, y, width, height) and maximized state. Save on `resize`/`move` (debounced). Restore on window creation. Handle edge case: saved position is off-screen (e.g., external monitor disconnected) — fall back to centered default.

2. **macOS app menu:** Build a `Menu` template with:
   - App menu: About LeadPulse, Separator, Auto-launch on Login (checkbox), Separator, Quit
   - Edit: Undo, Redo, Cut, Copy, Paste, Select All (required for text editing to work in Electron on macOS)
   - View: Reload, Toggle DevTools (dev only)
   - Window: Minimize, Zoom, Separator, Bring All to Front

3. **Native notifications:** Listen for IPC `'new-lead'` events from the renderer. When received, fire a `new Notification({ title: 'New Lead', body: '{name} from {city}' })`. On notification click, focus/show the main window.

4. **Dock badge:** On `'new-lead'` IPC, increment a counter and call `app.dock.setBadge(count.toString())`. Clear the badge when the window receives focus (`mainWindow.on('focus')`).

5. **Auto-launch on login:** Handle the `'set-auto-launch'` IPC from preload. Call `app.setLoginItemSettings({ openAtLogin: enabled })`. Persist the preference in `electron-store` and read it on startup for the menu checkbox state.

**Key files:**
- `electron/window-state.ts` (create)
- `electron/menu.ts` (create)
- `electron/notifications.ts` (create)

**Depends on:** Agent 2 (main process + window reference), Agent 3 (IPC bridge)

---

### Agent 5: UX & Packaging

**Role:** Splash screen, app icon, electron-builder config, and distribution readiness.

**Tasks:**
1. **Splash screen:** Create `electron/splash.html` — a single self-contained HTML file (inline CSS, no external deps). Dark background (#0a0a0a), centered LeadPulse logo (the Zap icon as inline SVG), app name "LeadPulse" in Oxanium font (inline or system fallback), subtle loading spinner or pulse animation. Shown in a frameless, non-resizable 400x300 window. Closed when the main window is ready.

2. **App icon:** Create or source a 1024x1024 PNG of the LeadPulse icon (Zap). Convert to `build/icon.icns` for macOS using `iconutil` or an equivalent tool. Also provide `build/icon.png` for the electron-builder fallback.

3. **Create `electron-builder.yml`:**
   ```yaml
   appId: com.leadpulse.desktop
   productName: LeadPulse
   directories:
     output: release
   mac:
     category: public.app-category.business
     target:
       - dmg
       - zip
     icon: build/icon.icns
   files:
     - .next/standalone/**/*
     - .next/static/**/*
     - public/**/*
     - electron/dist/**/*
   extraResources:
     - from: .next/static
       to: .next/static
   ```
   Verify that the standalone server can find its static assets at runtime. The standalone output expects `.next/static` relative to `server.js` — test this.

4. **Verify distribution:**
   - Build the `.dmg` and install it on a clean path (not the dev directory)
   - Launch — splash appears, then main app loads, auth works, leads display
   - Confirm the app appears in Applications and Dock correctly

**Key files:**
- `electron/splash.html` (create)
- `electron-builder.yml` (create)
- `build/icon.icns` (create)
- `build/icon.png` (create)

**Depends on:** Agents 1-4 complete

---

## Execution Order

```
Phase 1 (parallel):  Agent 1 (Build Engineer) + Agent 3 (Preload & IPC)
Phase 2 (parallel):  Agent 2 (Electron Core) + Agent 5 (splash + icon only)
Phase 3 (sequential): Agent 4 (Native Integration) — needs main process + IPC ready
Phase 4 (sequential): Agent 5 (packaging + verification) — needs everything wired up
```

---

## Definition of Done

- [ ] `npm run electron:dev` opens LeadPulse in an Electron window with full functionality
- [ ] `npm run electron:build` produces a `.dmg` in `release/`
- [ ] Installing the `.dmg` on macOS launches a working app with native titlebar
- [ ] Window position/size persists across launches
- [ ] "Simulate Lead" triggers both an in-app toast AND a macOS system notification
- [ ] Dock badge increments on new lead, clears on window focus
- [ ] Copy/paste works in all text fields (macOS Edit menu wired)
- [ ] App quits cleanly with no orphaned Node processes
- [ ] `vercel deploy` still works — no regressions to the web app
- [ ] Auto-launch on login toggleable from the app menu
