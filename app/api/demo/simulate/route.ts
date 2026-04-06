import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDemoLead } from "@/lib/ingestion/demo-data";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const demoLead = generateDemoLead();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      ...demoLead,
      source: "facebook_webhook",
      status: "new",
      raw_payload: { demo: true, ...demoLead },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead }, { status: 201 });
}
