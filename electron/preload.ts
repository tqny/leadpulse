import { contextBridge, ipcRenderer } from "electron";
import type { NewLeadPayload } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  onNewLead: (callback: (payload: NewLeadPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: NewLeadPayload) => {
      callback(payload);
    };
    ipcRenderer.on("new-lead", listener);
    return () => {
      ipcRenderer.removeListener("new-lead", listener);
    };
  },

  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  setAutoLaunch: (enabled: boolean) => {
    ipcRenderer.send("set-auto-launch", enabled);
  },
});
