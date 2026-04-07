import { Notification, ipcMain, app } from "electron";
import type { NewLeadPayload } from "./types";

let badgeCount = 0;

export function setupNotifications(): void {
  // No-op for now — notifications are triggered via handleNewLead()
  // called directly from the Supabase realtime subscription in main.ts
}

export function handleNewLead(payload: NewLeadPayload): void {
  showLeadNotification(payload);
  incrementBadge();
}

function showLeadNotification(payload: NewLeadPayload): void {
  if (!Notification.isSupported()) return;

  const body = payload.city
    ? `${payload.name} from ${payload.city}`
    : payload.name;

  const notification = new Notification({
    title: "New Lead",
    body,
    silent: false,
  });

  notification.on("click", () => {
    const { mainWindow } = require("./main");
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  notification.show();
}

function incrementBadge(): void {
  badgeCount++;
  if (app.dock) {
    app.dock.setBadge(badgeCount.toString());
  }
}

export function clearBadge(): void {
  badgeCount = 0;
  if (app.dock) {
    app.dock.setBadge("");
  }
}

export function initBadgeClearing(win: Electron.BrowserWindow): void {
  win.on("focus", () => {
    clearBadge();
  });
}
