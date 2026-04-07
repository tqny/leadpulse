import { Suspense } from "react";
import {
  getLeads,
  getLeadStats,
  type LeadFilters,
  type LeadSort,
} from "@/lib/supabase/queries/leads";
import type { Timeframe } from "@/lib/db/types";
import { DashboardStrip } from "@/components/leads/dashboard-strip";
import { LeadListClient } from "@/components/leads/lead-list-client";
import { LeadIntakeForm } from "@/components/leads/lead-intake-form";
import { RealtimeLeads } from "@/components/leads/realtime-leads";
import { LeadTableSkeleton } from "@/components/leads/lead-table";
import type { LeadStatus, LeadSource } from "@/lib/db/types";

interface LeadsPageProps {
  searchParams: Promise<{
    status?: string;
    source?: string;
    followUp?: string;
    timeframe?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;

  const filters: LeadFilters = {};
  if (params.status) filters.status = params.status as LeadStatus;
  if (params.source) filters.source = params.source as LeadSource;
  if (params.followUp)
    filters.followUp = params.followUp as "overdue" | "today" | "this_week";
  if (params.timeframe) filters.timeframe = params.timeframe as Timeframe;

  const sort: LeadSort = {
    column: (params.sort as LeadSort["column"]) ?? "created_at",
    direction: (params.dir as "asc" | "desc") ?? "desc",
  };

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [result, stats] = await Promise.all([
    getLeads(filters, sort, page),
    getLeadStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Leads</h2>
        <LeadIntakeForm />
      </div>

      <RealtimeLeads />
      <DashboardStrip stats={stats} />

      <Suspense fallback={<LeadTableSkeleton />}>
        <LeadListClient
          leads={result.leads}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
        />
      </Suspense>
    </div>
  );
}
