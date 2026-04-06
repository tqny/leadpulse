"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  userEmail: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-slate-500">
          Lead Management
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" disabled>
          Simulate Lead
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
