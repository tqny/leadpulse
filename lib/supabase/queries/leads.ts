import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus, LeadSource, Timeframe } from "@/lib/db/types";

export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  source?: LeadSource;
  followUp?: "overdue" | "today" | "this_week" | null;
  timeframe?: Timeframe;
}

export interface LeadSort {
  column: "name" | "created_at" | "follow_up_date" | "status";
  direction: "asc" | "desc";
}

export const PAGE_SIZE = 10;

export interface PaginatedLeads {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getLeads(
  filters?: LeadFilters,
  sort?: LeadSort,
  page: number = 1
): Promise<PaginatedLeads> {
  const supabase = await createClient();

  let query = supabase.from("leads").select("*", { count: "exact" });

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

  // Timeframe filter (default: last_month)
  const timeframe = filters?.timeframe ?? "last_month";
  if (timeframe !== "all") {
    const now = new Date();
    let cutoff: Date;
    if (timeframe === "last_week") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "last_month") {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }
    query = query.gte("created_at", cutoff.toISOString());
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

  // Pagination
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  const total = count ?? 0;
  return {
    leads: (data as Lead[]) ?? [],
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
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
    avgResponseTime: null,
  };
}
