"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Zap } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  userEmail: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter();
  const [simulating, setSimulating] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSimulate() {
    setSimulating(true);
    const res = await fetch("/api/demo/simulate", { method: "POST" });
    const data = await res.json();
    setSimulating(false);

    if (res.ok && data.lead) {
      toast.success(`New lead: ${data.lead.name} from ${data.lead.city ?? "unknown"}`);
      router.refresh();
    } else {
      toast.error("Failed to simulate lead");
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-slate-500">
          Lead Management
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSimulate}
          disabled={simulating}
        >
          <Zap className="mr-1 h-3 w-3" />
          {simulating ? "Simulating..." : "Simulate Lead"}
        </Button>

        {userEmail && (
          <span className="text-sm text-slate-500">{userEmail}</span>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
