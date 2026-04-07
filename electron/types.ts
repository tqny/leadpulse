export interface NewLeadPayload {
  name: string;
  city?: string;
}

export interface ElectronAPI {
  onNewLead: (callback: (payload: NewLeadPayload) => void) => () => void;
  getAppVersion: () => Promise<string>;
  setAutoLaunch: (enabled: boolean) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
