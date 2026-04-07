"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LEAD_STATUSES, LEAD_SOURCES, STATUS_LABELS } from "@/lib/db/types";
import { X } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  facebook_webhook: "Facebook",
  text_paste: "Text Paste",
  manual: "Manual",
  excel_upload: "Excel Import",
};

export function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? undefined;
  const currentSource = searchParams.get("source") ?? undefined;
  const currentFollowUp = searchParams.get("followUp") ?? undefined;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/leads?${params.toString()}`);
  }

  function clearAll() {
    router.push("/leads");
  }

  const hasFilters = !!(currentStatus || currentSource || currentFollowUp);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={currentStatus} onValueChange={(v) => setParam("status", v ?? "")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentSource} onValueChange={(v) => setParam("source", v ?? "")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All sources" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_SOURCES.map((s) => (
            <SelectItem key={s} value={s}>
              {SOURCE_LABELS[s] ?? s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFollowUp}
        onValueChange={(v) => setParam("followUp", v ?? "")}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Follow-up" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this_week">This week</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-muted-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
