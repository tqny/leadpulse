"use client";

import { useState, useEffect } from "react";
import { LeadTable } from "./lead-table";
import { LeadFilters } from "./lead-filters";
import { LeadPagination } from "./lead-pagination";
import { LeadDetailDrawer } from "./lead-detail-drawer";
import { createClient } from "@/lib/supabase/client";
import type { Lead, Activity } from "@/lib/db/types";
import { Inbox } from "lucide-react";

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
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(false);

  const fetchActivities = async (leadId: string) => {
    setActivitiesLoading(true);
    setActivitiesError(false);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setActivities((data as Activity[]) ?? []);
    } catch {
      setActivitiesError(true);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedLead(null);
      setActivities([]);
      setActivitiesError(false);
      return;
    }

    const lead = leads.find((l) => l.id === selectedLeadId) ?? null;
    setSelectedLead(lead);
    fetchActivities(selectedLeadId);
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
        activitiesLoading={activitiesLoading}
        activitiesError={activitiesError}
        onRetryActivities={() => selectedLeadId && fetchActivities(selectedLeadId)}
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <Inbox className="mx-auto h-10 w-10 text-muted-foreground/50" />
      <p className="mt-4 text-sm font-medium text-foreground">No leads yet</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
        Leads will appear here when they arrive via Facebook, text paste, Excel
        import, or manual entry.
      </p>
    </div>
  );
}
