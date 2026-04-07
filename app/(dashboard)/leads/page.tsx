import { Suspense } from "react";
import { getLeads, type LeadFilters, type LeadSort } from "@/lib/supabase/queries/leads";
import { getLeadStats } from "@/lib/supabase/queries/leads";
import { DashboardStrip } from "@/components/leads/dashboard-strip";
import { LeadListClient } from "@/components/leads/lead-list-client";
import { LeadIntakeForm } from "@/components/leads/lead-intake-form";
import { RealtimeLeads } from "@/components/leads/realtime-leads";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeadStatus, LeadSource } from "@/lib/db/types";

interface LeadsPageProps {
  searchParams: Promise<{
    status?: string;
    source?: string;
    followUp?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;

  const filters: LeadFilters = {};
  if (params.status) filters.status = params.status as LeadStatus;
  if (params.source) filters.source = params.source as LeadSource;
  if (params.followUp)
    filters.followUp = params.followUp as "overdue" | "today" | "this_week";

  const sort: LeadSort = {
    column: (params.sort as LeadSort["column"]) ?? "created_at",
    direction: (params.dir as "asc" | "desc") ?? "desc",
  };

  const [leads, stats] = await Promise.all([
    getLeads(filters, sort),
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

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <LeadListClient leads={leads} />
      </Suspense>
    </div>
  );
}
