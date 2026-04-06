import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/lib/db/types";

export async function getActivitiesByLeadId(
  leadId: string
): Promise<Activity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Activity[]) ?? [];
}

export async function createActivity(
  activity: Omit<Activity, "id" | "created_at">
): Promise<Activity> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
}
