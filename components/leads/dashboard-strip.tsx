import { STATUS_LABELS, type LeadStatus } from "@/lib/db/types";
import { formatCurrency } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStripProps {
  stats: {
    total: number;
    statusCounts: Record<string, number>;
    pipelineValue: number;
    avgResponseTime: number | null;
  };
}

const HIGHLIGHT_STATUSES: LeadStatus[] = ["new", "contacted", "proposal", "won"];

export function DashboardStrip({ stats }: DashboardStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card label="Total Leads" value={String(stats.total)} />
      {HIGHLIGHT_STATUSES.map((s) => (
        <Card
          key={s}
          label={STATUS_LABELS[s]}
          value={String(stats.statusCounts[s] ?? 0)}
        />
      ))}
      <Card
        label="Pipeline Value"
        value={stats.pipelineValue > 0 ? formatCurrency(stats.pipelineValue) : "$0"}
      />
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-elevated px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
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
