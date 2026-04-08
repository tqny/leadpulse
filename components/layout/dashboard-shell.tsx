"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface DashboardShellProps {
  userEmail: string | null;
  children: React.ReactNode;
}

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
          <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userEmail={userEmail}
          onMobileNavToggle={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-auto p-3 sm:p-6 bg-[#C0C0C0]">{children}</main>
      </div>
    </div>
  );
}
