"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { STATUS_LABELS, type LeadStatus } from "@/lib/db/types";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStripProps {
  stats: {
    total: number;
    statusCounts: Record<string, number>;
    pipelineValue: number;
    avgResponseTime: number | null;
  };
}

const HIGHLIGHT_STATUSES: LeadStatus[] = ["new", "contacted", "proposal", "won", "lost"];

const VALUE_COLORS: Record<string, string> = {
  "Total Leads": "text-purple-500",
  New: "text-blue-500",
  Contacted: "text-teal-500",
  Proposal: "text-purple-500",
  Won: "text-green-500",
  Lost: "text-red-500",
};

const GLOW_STYLES: Record<LeadStatus, { boxShadow: string; classes: string }> = {
  new: {
    boxShadow: "0 0 8px 2px rgba(59,130,246,0.45), inset 0 0 16px rgba(59,130,246,0.15)",
    classes: "border-blue-500 bg-blue-50 ring-2 ring-blue-400/60",
  },
  contacted: {
    boxShadow: "0 0 8px 2px rgba(20,184,166,0.45), inset 0 0 16px rgba(20,184,166,0.15)",
    classes: "border-teal-500 bg-teal-50 ring-2 ring-teal-400/60",
  },
  proposal: {
    boxShadow: "0 0 8px 2px rgba(168,85,247,0.45), inset 0 0 16px rgba(168,85,247,0.15)",
    classes: "border-purple-500 bg-purple-50 ring-2 ring-purple-400/60",
  },
  won: {
    boxShadow: "0 0 8px 2px rgba(34,197,94,0.45), inset 0 0 16px rgba(34,197,94,0.15)",
    classes: "border-green-500 bg-green-50 ring-2 ring-green-400/60",
  },
  no_response: { boxShadow: "", classes: "" },
  lost: {
    boxShadow: "0 0 8px 2px rgba(239,68,68,0.45), inset 0 0 16px rgba(239,68,68,0.15)",
    classes: "border-red-500 bg-red-50 ring-2 ring-red-400/60",
  },
};

export function DashboardStrip({ stats }: DashboardStripProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status") ?? "";
  const selectedStatuses = statusParam ? statusParam.split(",") as LeadStatus[] : [];
  const noStatusFilter = selectedStatuses.length === 0;

  function toggleStatus(status: LeadStatus) {
    const params = new URLSearchParams(searchParams.toString());
    let next: LeadStatus[];

    if (selectedStatuses.includes(status)) {
      // Already selected — remove it
      next = selectedStatuses.filter((s) => s !== status);
    } else {
      // Add it
      next = [...selectedStatuses, status];
    }

    if (next.length === 0) {
      params.delete("status");
    } else {
      params.set("status", next.join(","));
    }
    params.delete("page");
    router.push(`/leads?${params.toString()}`);
  }

  function deselectStatus(status: LeadStatus) {
    const params = new URLSearchParams(searchParams.toString());
    const next = selectedStatuses.filter((s) => s !== status);
    if (next.length === 0) {
      params.delete("status");
    } else {
      params.set("status", next.join(","));
    }
    params.delete("page");
    router.push(`/leads?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card
        label="Total Leads"
        value={String(stats.total)}
        selected={noStatusFilter}
        glowStyle={{
          boxShadow: "0 0 8px 2px rgba(168,85,247,0.45), inset 0 0 16px rgba(168,85,247,0.15)",
          classes: "border-purple-500 bg-purple-50 ring-2 ring-purple-400/60",
        }}
      />
      {HIGHLIGHT_STATUSES.map((s) => (
        <Card
          key={s}
          label={STATUS_LABELS[s]}
          value={String(stats.statusCounts[s] ?? 0)}
          selected={selectedStatuses.includes(s)}
          glowStyle={GLOW_STYLES[s]}
          onClick={() => toggleStatus(s)}
          onDoubleClick={() => deselectStatus(s)}
        />
      ))}
    </div>
  );
}

function Card({
  label,
  value,
  selected,
  glowStyle,
  onClick,
  onDoubleClick,
}: {
  label: string;
  value: string;
  selected?: boolean;
  glowStyle?: { boxShadow: string; classes: string };
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  const colorClass = VALUE_COLORS[label] ?? "text-foreground";
  const isInteractive = !!onClick;
  const isGlowing = selected && glowStyle?.boxShadow;

  return (
    <div
      className={`border px-4 py-3 transition-all duration-200 ${
        isGlowing
          ? `${glowStyle.classes} -translate-y-1`
          : "bg-elevated border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/30"
      } ${isInteractive ? "cursor-pointer select-none" : ""}`}
      style={isGlowing ? { boxShadow: glowStyle.boxShadow } : undefined}
      onClick={onClick}
      onDoubleClick={(e) => {
        if (onDoubleClick) {
          e.stopPropagation();
          onDoubleClick();
        }
      }}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}

export function DashboardStripSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-border bg-elevated px-4 py-3 shadow-sm">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
