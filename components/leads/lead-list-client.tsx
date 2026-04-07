"use client";

import { useState, useEffect } from "react";
import { LeadTable } from "./lead-table";
import { LeadFilters } from "./lead-filters";
import { LeadPagination } from "./lead-pagination";
import { LeadDetailDrawer } from "./lead-detail-drawer";
import { createClient } from "@/lib/supabase/client";
import type { Lead, Activity } from "@/lib/db/types";

interface LeadListClientProps {
  leads: Lead[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function LeadListClient({
  leads,
  page,
  totalPages,
  total,
  pageSize,
}: LeadListClientProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedLead(null);
      setActivities([]);
      return;
    }

    const lead = leads.find((l) => l.id === selectedLeadId) ?? null;
    setSelectedLead(lead);

    async function fetchActivities() {
      const supabase = createClient();
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("lead_id", selectedLeadId)
        .order("created_at", { ascending: false });
      setActivities((data as Activity[]) ?? []);
    }

    fetchActivities();
  }, [selectedLeadId, leads]);

  return (
    <div className="space-y-4">
      <LeadFilters />

      <div>
        <LeadTable
          leads={leads}
          onSelectLead={setSelectedLeadId}
          startIndex={(page - 1) * pageSize}
        />
        <LeadPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
        />
      </div>

      {leads.length === 0 && <EmptyState />}

      <LeadDetailDrawer
        lead={selectedLead}
        activities={activities}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">No leads yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Leads will appear here when they arrive via Facebook, text paste, or
        Excel import.
      </p>
    </div>
  );
}
