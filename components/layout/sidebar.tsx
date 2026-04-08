"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Upload, Settings, ChevronLeft, ChevronRight, Hammer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/leads", label: "Leads", icon: Users, color: "text-blue-500" },
  { href: "/import", label: "Import", icon: Upload, color: "text-teal-500" },
  { href: "/settings", label: "Settings", icon: Settings, color: "text-gray-500" },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const showLabels = mobile || !collapsed;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        mobile ? "w-60" : collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        {showLabels && (
          <span className="text-lg font-semibold text-foreground">
            LeadPulse
          </span>
        )}
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? `bg-muted text-foreground border-l-2 ${item.color.replace("text-", "border-")}`
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1 transition-all duration-200"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
              {showLabels && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <Hammer className="h-4 w-4 shrink-0 text-amber-700" />
          {showLabels && (
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Epoxy Bros
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
