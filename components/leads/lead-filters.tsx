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
import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  STATUS_LABELS,
  TIMEFRAMES,
  TIMEFRAME_LABELS,
  type Timeframe,
  type LeadStatus,
} from "@/lib/db/types";
import { X, Calendar } from "lucide-react";

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
  const currentTimeframe =
    (searchParams.get("timeframe") as Timeframe) ?? "last_month";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    params.delete("page");
    router.push(`/leads?${params.toString()}`);
  }

  function clearAll() {
    router.push("/leads");
  }

  const hasFilters = !!(
    currentStatus ||
    currentSource ||
    currentFollowUp ||
    (currentTimeframe && currentTimeframe !== "last_month")
  );

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-card border border-border p-2 sm:p-3 transition-all duration-200 hover:shadow-md hover:border-foreground/30">
      <Select
        value={currentTimeframe ?? "last_month"}
        onValueChange={(v) => setParam("timeframe", v === "last_month" ? "" : v ?? "")}
      >
        <SelectTrigger className="w-full sm:w-[160px] border-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
          <SelectValue>
            {TIMEFRAME_LABELS[(currentTimeframe ?? "last_month") as Timeframe] ?? "Last Month"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIMEFRAMES.map((t) => (
            <SelectItem key={t} value={t}>
              {TIMEFRAME_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus ?? "all"}
        onValueChange={(v) => setParam("status", v === "all" ? "" : v ?? "")}
      >
        <SelectTrigger className="w-[calc(50%-4px)] sm:w-[160px] border-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <SelectValue>
            {currentStatus ? STATUS_LABELS[currentStatus as LeadStatus] : "All Statuses"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSource ?? "all"}
        onValueChange={(v) => setParam("source", v === "all" ? "" : v ?? "")}
      >
        <SelectTrigger className="w-[calc(50%-4px)] sm:w-[160px] border-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <SelectValue>
            {currentSource ? (SOURCE_LABELS[currentSource] ?? currentSource) : "All Sources"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          {LEAD_SOURCES.map((s) => (
            <SelectItem key={s} value={s}>
              {SOURCE_LABELS[s] ?? s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFollowUp ?? "all"}
        onValueChange={(v) => setParam("followUp", v === "all" ? "" : v ?? "")}
      >
        <SelectTrigger className="w-[calc(50%-4px)] sm:w-[160px] border-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <SelectValue>
            {currentFollowUp === "overdue" ? "Overdue" : currentFollowUp === "today" ? "Today" : currentFollowUp === "this_week" ? "This Week" : "All Follow-ups"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Follow-ups</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this_week">This Week</SelectItem>
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
