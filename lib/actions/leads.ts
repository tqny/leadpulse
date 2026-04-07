"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { leadStatusSchema, leadFieldsSchema } from "@/lib/ingestion/schemas";
import type { LeadStatus } from "@/lib/db/types";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const parsed = leadStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { error: "Invalid status" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  return { success: true };
}

export async function updateLeadFields(
  leadId: string,
  fields: Record<string, unknown>
) {
  const parsed = leadFieldsSchema.safeParse(fields);
  if (!parsed.success) {
    return { error: "Invalid fields", details: parsed.error.issues };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update(parsed.data)
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  return { success: true };
}

export async function deleteLead(leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  return { success: true };
}
