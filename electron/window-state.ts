import ElectronStore from "electron-store";
import { BrowserWindow, screen } from "electron";

interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowStateSchema {
  windowBounds: WindowBounds;
  isMaximized: boolean;
}

const store = new ElectronStore<WindowStateSchema>({
  name: "window-state",
  defaults: {
    windowBounds: { x: 0, y: 0, width: 1280, height: 860 },
    isMaximized: false,
  },
});

function isOnScreen(bounds: WindowBounds): boolean {
  const displays = screen.getAllDisplays();
  return displays.some((display) => {
    const { x, y, width, height } = display.workArea;
    return (
      bounds.x >= x - 100 &&
      bounds.y >= y - 100 &&
      bounds.x < x + width - 50 &&
      bounds.y < y + height - 50
    );
  });
}

export function restoreWindowState():
  | (WindowBounds & { isMaximized?: boolean })
  | undefined {
  try {
    // First launch: no saved state yet — use defaults (centered by Electron)
    if (!store.has("windowBounds")) return undefined;

    const bounds = store.get("windowBounds");
    const isMaximized = store.get("isMaximized");
    if (bounds && isOnScreen(bounds)) {
      return { ...bounds, isMaximized };
    }
  } catch {
    // corrupted store — use defaults
  }
  return undefined;
}

export function trackWindowState(win: BrowserWindow): void {
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  const save = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (win.isDestroyed()) return;
      store.set("isMaximized", win.isMaximized());
      if (!win.isMaximized() && !win.isMinimized()) {
        store.set("windowBounds", win.getBounds());
      }
    }, 500);
  };

  win.on("resize", save);
  win.on("move", save);
  win.on("close", save);
}
