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
import { formatDate, formatRelativeTime, formatPhone } from "@/lib/utils/format";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
  startIndex?: number;
}

const SORTABLE_COLUMNS = [
  { key: "name", label: "Lead Name", minWidth: "min-w-[180px]" },
  { key: "status", label: "Status", minWidth: "min-w-[110px]" },
  { key: "created_at", label: "Created", minWidth: "min-w-[110px]" },
  { key: "follow_up_date", label: "Follow-up", minWidth: "min-w-[110px]" },
] as const;

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
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="w-[48px] text-center text-xs font-semibold text-muted-foreground">
              #
            </TableHead>
            {SORTABLE_COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  col.minWidth
                )}
                onClick={() => toggleSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown
                    className={cn(
                      "h-3 w-3 shrink-0",
                      currentSort === col.key
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                    )}
                  />
                </span>
              </TableHead>
            ))}
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[130px]">
              Location
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[90px]">
              Source
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[80px]">
              Urgency
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-elevated transition-colors"
              onClick={() => onSelectLead(lead.id)}
            >
              {/* Row number */}
              <TableCell className="text-center text-xs text-muted-foreground font-medium">
                {startIndex + index + 1}
              </TableCell>

              {/* Name + phone (no avatar) */}
              <TableCell>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {lead.name}
                  </p>
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-xs text-muted-foreground hover:text-primary truncate block max-w-[200px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {formatPhone(lead.phone)}
                    </a>
                  )}
                </div>
              </TableCell>

              {/* Status */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <LeadStatusBadge leadId={lead.id} status={lead.status} />
              </TableCell>

              {/* Created date */}
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(lead.created_at)}
              </TableCell>

              {/* Follow-up */}
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {lead.follow_up_date
                  ? formatDate(lead.follow_up_date)
                  : "—"}
              </TableCell>

              {/* Location */}
              <TableCell className="text-sm text-muted-foreground">
                <span className="truncate block max-w-[140px]">
                  {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                </span>
              </TableCell>

              {/* Source */}
              <TableCell>
                <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground whitespace-nowrap">
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

export function LeadTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="bg-muted px-4 py-3">
        <div className="flex gap-6">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-t border-border px-4 py-3">
          <Skeleton className="h-4 w-6" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}
