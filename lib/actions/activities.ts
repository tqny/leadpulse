"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createActivitySchema } from "@/lib/ingestion/schemas";
import type { ActivityType } from "@/lib/db/types";

export async function createActivityAction(
  leadId: string,
  type: ActivityType,
  content?: string | null
) {
  const parsed = createActivitySchema.safeParse({
    lead_id: leadId,
    type,
    content: content || null,
  });
  if (!parsed.success) {
    return { error: "Invalid activity data", details: parsed.error.issues };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("activities").insert({
    lead_id: parsed.data.lead_id,
    user_id: user.id,
    type: parsed.data.type,
    content: parsed.data.content,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  return { success: true };
}
