import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus, LeadSource } from "@/lib/db/types";

export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource;
  followUp?: "overdue" | "today" | "this_week" | null;
}

export interface LeadSort {
  column: "name" | "created_at" | "follow_up_date" | "status";
  direction: "asc" | "desc";
}

export async function getLeads(
  filters?: LeadFilters,
  sort?: LeadSort
): Promise<Lead[]> {
  const supabase = await createClient();

  let query = supabase.from("leads").select("*");

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in("status", filters.status);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  if (filters?.source) {
    query = query.eq("source", filters.source);
  }

  if (filters?.followUp) {
    const today = new Date().toISOString().split("T")[0];
    if (filters.followUp === "overdue") {
      query = query.lt("follow_up_date", today).not("follow_up_date", "is", null);
    } else if (filters.followUp === "today") {
      query = query.eq("follow_up_date", today);
    } else if (filters.followUp === "this_week") {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      query = query
        .gte("follow_up_date", today)
        .lte("follow_up_date", nextWeek.toISOString().split("T")[0]);
    }
  }

  const sortCol = sort?.column ?? "created_at";
  const sortDir = sort?.direction ?? "desc";
  query = query.order(sortCol, { ascending: sortDir === "asc" });

  const { data, error } = await query;

  if (error) throw error;
  return (data as Lead[]) ?? [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Lead;
}

export async function createLead(
  lead: Omit<Lead, "id" | "created_at" | "updated_at">
): Promise<Lead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert(lead)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function updateLead(
  id: string,
  fields: Partial<Lead>
): Promise<Lead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function getLeadStats() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("status, quote_amount, created_at");

  if (error) throw error;

  const all = leads ?? [];
  const statusCounts: Record<string, number> = {};
  let pipelineValue = 0;
  let totalResponseTime = 0;
  let contactedCount = 0;

  for (const lead of all) {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;

    if (lead.status === "proposal" && lead.quote_amount) {
      pipelineValue += Number(lead.quote_amount);
    }
  }

  return {
    total: all.length,
    statusCounts,
    pipelineValue,
    avgResponseTime: contactedCount > 0 ? totalResponseTime / contactedCount : null,
  };
}
