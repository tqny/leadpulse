"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadStatusBadge } from "./lead-status-badge";
import { LeadUrgencyBadge } from "./lead-urgency-badge";
import type { Lead } from "@/lib/db/types";
import { formatRelativeTime, formatPhone } from "@/lib/utils/format";
import { ArrowUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
  startIndex?: number;
}

const SORTABLE_COLUMNS = [
  { key: "name", label: "Lead Name", width: "w-[240px]" },
  { key: "status", label: "Status", width: "w-[120px]" },
  { key: "created_at", label: "Last Interaction", width: "w-[160px]" },
  { key: "follow_up_date", label: "Follow-up", width: "w-[120px]" },
] as const;

// Generate a consistent color from a string
function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const SOURCE_LABELS: Record<string, string> = {
  facebook_webhook: "Facebook",
  text_paste: "Paste",
  excel_upload: "Excel",
  manual: "Manual",
};

export function LeadTable({ leads, onSelectLead, startIndex = 0 }: LeadTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "created_at";
  const currentDir = searchParams.get("dir") ?? "desc";

  function toggleSort(column: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSort === column) {
      params.set("dir", currentDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", column);
      params.set("dir", "desc");
    }
    router.push(`/leads?${params.toString()}`);
  }

  if (leads.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[48px] text-center text-xs font-semibold text-muted-foreground">
              #
            </TableHead>
            {SORTABLE_COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  col.width
                )}
                onClick={() => toggleSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown
                    className={cn(
                      "h-3 w-3",
                      currentSort === col.key
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                    )}
                  />
                </span>
              </TableHead>
            ))}
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[120px]">
              Location
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[100px]">
              Source
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">
              Urgency
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => onSelectLead(lead.id)}
            >
              {/* Row number */}
              <TableCell className="text-center text-xs text-muted-foreground font-medium">
                {startIndex + index + 1}
              </TableCell>

              {/* Name with avatar */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                      getAvatarColor(lead.name)
                    )}
                  >
                    {getInitials(lead.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lead.name}
                    </p>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-xs text-muted-foreground hover:text-primary truncate block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {formatPhone(lead.phone)}
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <LeadStatusBadge leadId={lead.id} status={lead.status} />
              </TableCell>

              {/* Last interaction (relative time) */}
              <TableCell className="text-sm text-muted-foreground">
                {formatRelativeTime(lead.created_at)}
              </TableCell>

              {/* Follow-up */}
              <TableCell className="text-sm text-muted-foreground">
                {lead.follow_up_date
                  ? formatRelativeTime(lead.follow_up_date + "T00:00:00")
                  : "—"}
              </TableCell>

              {/* Location */}
              <TableCell className="text-sm text-muted-foreground">
                {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
              </TableCell>

              {/* Source */}
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </span>
              </TableCell>

              {/* Urgency */}
              <TableCell>
                <LeadUrgencyBadge
                  createdAt={lead.created_at}
                  status={lead.status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
