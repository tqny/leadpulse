"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Zap, Menu } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  userEmail: string | null;
  onMobileNavToggle?: () => void;
}

export function Header({ userEmail, onMobileNavToggle }: HeaderProps) {
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
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-3 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground md:hidden"
          onClick={onMobileNavToggle}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-sm font-medium text-muted-foreground hidden sm:block">
          Lead Management
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSimulate}
          disabled={simulating}
        >
          <Zap className="mr-1 h-3 w-3" />
          <span className="hidden sm:inline">{simulating ? "Simulating..." : "Simulate Lead"}</span>
          <span className="sm:hidden">{simulating ? "..." : "Demo"}</span>
        </Button>

        {userEmail && (
          <span className="hidden lg:inline text-sm text-muted-foreground">{userEmail}</span>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
