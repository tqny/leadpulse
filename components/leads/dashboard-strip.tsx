import { STATUS_LABELS, type LeadStatus } from "@/lib/db/types";
import { formatCurrency } from "@/lib/utils/format";

interface DashboardStripProps {
  stats: {
    total: number;
    statusCounts: Record<string, number>;
    pipelineValue: number;
    avgResponseTime: number | null;
  };
}

const HIGHLIGHT_STATUSES: LeadStatus[] = ["new", "contacted", "proposal", "won"];

const VALUE_COLORS: Record<string, string> = {
  "Total Leads": "text-purple-500",
  "New": "text-blue-500",
  "Contacted": "text-teal-500",
  "Proposal": "text-purple-500",
  "Won": "text-green-500",
  "Pipeline Value": "text-green-500",
};

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
  const colorClass = VALUE_COLORS[label] ?? "text-foreground";
  return (
    <div className="border border-border bg-elevated px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/30">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}
