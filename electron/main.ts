import { app, BrowserWindow, ipcMain } from "electron";
import { getPort } from "get-port-please";
import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import http from "http";
import { restoreWindowState, trackWindowState } from "./window-state";
import { setupMenu, prefsStore } from "./menu";
import { setupNotifications, handleNewLead, initBadgeClearing } from "./notifications";

// ── State ──────────────────────────────────────────────────────────────────────

export let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let serverPort: number = 3000;
let isQuitting = false;

// ── Helpers ────────────────────────────────────────────────────────────────────

const isDev = !app.isPackaged;

function loadEnvFile(): void {
  const envPath = path.join(app.getAppPath(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

function waitForServer(port: number, timeoutMs = 15000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server did not respond within ${timeoutMs}ms`));
        return;
      }
      const req = http.get(`http://localhost:${port}`, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        setTimeout(check, 200);
      });
      req.setTimeout(1000, () => {
        req.destroy();
        setTimeout(check, 200);
      });
    };
    check();
  });
}

// ── Server Lifecycle ───────────────────────────────────────────────────────────

async function startServer(): Promise<number> {
  if (isDev) {
    // In dev mode, next dev is expected to already be running on port 3000
    return 3000;
  }

  const port = await getPort({ portRange: [3100, 3999] });
  const standalonePath = path.join(
    process.resourcesPath ?? path.join(__dirname, ".."),
    ".next",
    "standalone",
    "server.js"
  );

  serverProcess = spawn(process.execPath, [standalonePath], {
    env: {
      ...process.env,
      PORT: port.toString(),
      HOSTNAME: "localhost",
    },
    stdio: "pipe",
  });

  serverProcess.stdout?.on("data", (data: Buffer) => {
    console.log(`[next] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on("data", (data: Buffer) => {
    console.error(`[next] ${data.toString().trim()}`);
  });

  serverProcess.on("exit", (code) => {
    if (!isQuitting) {
      console.error(`Next.js server exited unexpectedly with code ${code}`);
    }
    serverProcess = null;
  });

  return port;
}

function killServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!serverProcess) {
      resolve();
      return;
    }

    const proc = serverProcess;
    serverProcess = null;

    const forceKillTimer = setTimeout(() => {
      try {
        proc.kill("SIGKILL");
      } catch {
        // already dead
      }
      resolve();
    }, 5000);

    proc.on("exit", () => {
      clearTimeout(forceKillTimer);
      resolve();
    });

    try {
      proc.kill("SIGTERM");
    } catch {
      clearTimeout(forceKillTimer);
      resolve();
    }
  });
}

// ── Window Creation ────────────────────────────────────────────────────────────

function createSplash(): void {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    resizable: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashPath = isDev
    ? path.join(__dirname, "..", "splash.html")
    : path.join(process.resourcesPath ?? __dirname, "electron", "splash.html");

  splashWindow.loadFile(splashPath);
}

async function createMainWindow(): Promise<void> {
  let windowOpts: Electron.BrowserWindowConstructorOptions = {
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    show: false,
    backgroundColor: "#161616",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  };

  const savedBounds = restoreWindowState();
  if (savedBounds) {
    windowOpts = { ...windowOpts, ...savedBounds };
  }

  mainWindow = new BrowserWindow(windowOpts);

  // Inject CSS for titlebar padding (hiddenInset overlap fix)
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.insertCSS(
      "body { padding-top: 28px !important; }"
    );
  });

  mainWindow.on("ready-to-show", () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  trackWindowState(mainWindow);
  initBadgeClearing(mainWindow);

  mainWindow.loadURL(`http://localhost:${serverPort}`);
}

// ── IPC Handlers ───────────────────────────────────────────────────────────────

function setupIPC(): void {
  ipcMain.handle("get-app-version", () => app.getVersion());

  ipcMain.on("set-auto-launch", (_event, enabled: boolean) => {
    if (app.isPackaged) {
      app.setLoginItemSettings({ openAtLogin: enabled });
    }
    prefsStore.set("autoLaunch", enabled);
  });
}

// ── Supabase Realtime (notification bridge) ────────────────────────────────────

let supabaseCleanup: (() => void) | null = null;

function setupRealtimeSubscription(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[realtime] Missing Supabase env vars, skipping subscription");
    return;
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(url, key);

    const channel = supabase
      .channel("electron-leads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (dbPayload: { new: Record<string, unknown> }) => {
          const lead = dbPayload.new;
          const name =
            (lead.name as string) ||
            [lead.first_name, lead.last_name].filter(Boolean).join(" ") ||
            "Unknown";
          const city = (lead.city as string) || undefined;

          const leadPayload = { name, city };

          // Send to renderer via IPC (for preload bridge)
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("new-lead", leadPayload);
          }

          // Fire native notification + dock badge
          handleNewLead(leadPayload);
        }
      )
      .subscribe();

    supabaseCleanup = () => {
      supabase.removeChannel(channel);
    };
  } catch {
    console.warn("[realtime] @supabase/supabase-js not available");
  }
}

// ── App Lifecycle ──────────────────────────────────────────────────────────────

app.on("ready", async () => {
  // Load env vars from .env.local in dev
  if (isDev) {
    loadEnvFile();
  }

  setupIPC();

  setupMenu();
  setupNotifications();

  createSplash();

  try {
    serverPort = await startServer();
    await waitForServer(serverPort);
    await createMainWindow();
    setupRealtimeSubscription();
  } catch (err) {
    console.error("Failed to start:", err);
    if (splashWindow) {
      splashWindow.close();
    }
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", async () => {
  isQuitting = true;
  if (supabaseCleanup) {
    supabaseCleanup();
    supabaseCleanup = null;
  }
  await killServer();
});
