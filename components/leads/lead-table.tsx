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
import { formatDate, formatPhone } from "@/lib/utils/format";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}

const SORTABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "created_at", label: "Created" },
  { key: "follow_up_date", label: "Follow-up" },
  { key: "status", label: "Status" },
] as const;

export function LeadTable({ leads, onSelectLead }: LeadTableProps) {
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
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            {SORTABLE_COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className="cursor-pointer select-none"
                onClick={() => toggleSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown
                    className={cn(
                      "h-3 w-3",
                      currentSort === col.key
                        ? "text-slate-900"
                        : "text-slate-300"
                    )}
                  />
                </span>
              </TableHead>
            ))}
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Urgency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => onSelectLead(lead.id)}
            >
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell className="text-slate-500 text-sm">
                {formatDate(lead.created_at)}
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {lead.follow_up_date ? formatDate(lead.follow_up_date) : "—"}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <LeadStatusBadge leadId={lead.id} status={lead.status} />
              </TableCell>
              <TableCell className="text-sm">
                {lead.phone ? formatPhone(lead.phone) : "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
              </TableCell>
              <TableCell className="text-xs text-slate-400">
                {lead.source === "facebook_webhook"
                  ? "Facebook"
                  : lead.source === "text_paste"
                    ? "Paste"
                    : lead.source === "excel_upload"
                      ? "Excel"
                      : "Manual"}
              </TableCell>
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
