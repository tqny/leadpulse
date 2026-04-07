"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/db/types";
import { updateLeadStatus } from "@/lib/actions/leads";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  contacted: "bg-teal-100 text-teal-700 hover:bg-teal-200",
  no_response: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  proposal: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  won: "bg-green-100 text-green-700 hover:bg-green-200",
  lost: "bg-muted text-muted-foreground hover:bg-muted/80",
};

interface LeadStatusBadgeProps {
  leadId: string;
  status: LeadStatus;
  interactive?: boolean;
}

export function LeadStatusBadge({
  leadId,
  status,
  interactive = true,
}: LeadStatusBadgeProps) {
  const badge = (
    <Badge
      variant="secondary"
      className={cn(
        "cursor-pointer text-xs font-medium",
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );

  if (!interactive) return badge;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{badge}</DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {LEAD_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={async () => {
              if (s !== status) {
                await updateLeadStatus(leadId, s);
              }
            }}
            className={cn(s === status && "font-medium")}
          >
            <span
              className={cn(
                "mr-2 h-2 w-2 rounded-full",
                STATUS_COLORS[s].split(" ")[0]
              )}
            />
            {STATUS_LABELS[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
