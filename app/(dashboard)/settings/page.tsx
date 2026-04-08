"use client";

import { Phone, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePhoneProvider,
  type PhoneProvider,
} from "@/lib/hooks/use-phone-provider";

const PROVIDERS: {
  value: PhoneProvider;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "native",
    label: "Phone (Default)",
    description: "Uses your device\u2019s built-in dialer and SMS app.",
    icon: Smartphone,
  },
  {
    value: "ringcentral",
    label: "RingCentral",
    description:
      "Routes calls and texts through the RingCentral app so leads see your business number.",
    icon: Phone,
  },
];

export default function SettingsPage() {
  const [provider, setProvider] = usePhoneProvider();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how LeadPulse works for you.
        </p>
      </div>

      {/* ── Phone Provider ── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Phone Provider
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose how Call&nbsp;/&nbsp;Text buttons connect to leads.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PROVIDERS.map((p) => {
            const active = provider === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setProvider(p.value)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                <p.icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-primary" : "text-foreground"
                    )}
                  >
                    {p.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {provider === "ringcentral" && (
          <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">
            Make sure the RingCentral app is installed on your phone. When you
            tap Call or Text on a lead, it will open in RingCentral instead of
            your default dialer.
          </p>
        )}
      </section>
    </div>
  );
}
