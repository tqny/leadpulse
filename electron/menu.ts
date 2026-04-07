import { Menu, app, type MenuItemConstructorOptions } from "electron";
import ElectronStore from "electron-store";

interface MenuPrefsSchema {
  autoLaunch: boolean;
}

export const prefsStore = new ElectronStore<MenuPrefsSchema>({
  name: "preferences",
  defaults: {
    autoLaunch: false,
  },
});

export function setupMenu(): void {
  const autoLaunch = prefsStore.get("autoLaunch", false);

  // Sync the actual login item setting on startup (only works in packaged builds)
  if (app.isPackaged) {
    app.setLoginItemSettings({ openAtLogin: autoLaunch });
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: "about", label: `About ${app.name}` },
        { type: "separator" },
        {
          label: "Auto-launch on Login",
          type: "checkbox",
          checked: autoLaunch,
          click: (menuItem) => {
            const enabled = menuItem.checked;
            if (app.isPackaged) {
              app.setLoginItemSettings({ openAtLogin: enabled });
            }
            prefsStore.set("autoLaunch", enabled);
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        ...(app.isPackaged
          ? []
          : [{ role: "toggleDevTools" as const }]),
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
