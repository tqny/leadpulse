"use client";

import { useCallback, useSyncExternalStore } from "react";

export type PhoneProvider = "native" | "ringcentral";

const STORAGE_KEY = "leadpulse:phone-provider";

function getSnapshot(): PhoneProvider {
  if (typeof window === "undefined") return "native";
  return (localStorage.getItem(STORAGE_KEY) as PhoneProvider) ?? "native";
}

function getServerSnapshot(): PhoneProvider {
  return "native";
}

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function emitChange() {
  for (const l of listeners) l();
}

export function usePhoneProvider() {
  const provider = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setProvider = useCallback((p: PhoneProvider) => {
    localStorage.setItem(STORAGE_KEY, p);
    emitChange();
  }, []);

  return [provider, setProvider] as const;
}

/** Build the correct href for a call action */
export function callHref(phone: string, provider: PhoneProvider): string {
  if (provider === "ringcentral") {
    return `rcapp://call?number=${encodeURIComponent(phone)}`;
  }
  return `tel:${phone}`;
}

/** Build the correct href for a text/SMS action */
export function smsHref(phone: string, provider: PhoneProvider): string {
  if (provider === "ringcentral") {
    return `rcapp://text?number=${encodeURIComponent(phone)}`;
  }
  return `sms:${phone}`;
}
