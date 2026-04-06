import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseTextNotification } from "@/lib/ingestion/parser";
import { textParseInputSchema } from "@/lib/ingestion/schemas";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const inputParsed = textParseInputSchema.safeParse(body);
  if (!inputParsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: inputParsed.error.issues },
      { status: 400 }
    );
  }

  const result = parseTextNotification(inputParsed.data.text);

  // Store raw ingestion event
  await supabase.from("ingestion_events").insert({
    user_id: user.id,
    source: "text_paste",
    raw_payload: { text: inputParsed.data.text },
    parsed: result.success,
    error: result.success ? null : result.error,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Parse failed", details: result.error },
      { status: 422 }
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      ...result.data,
      source: "text_paste",
      status: "new",
      raw_payload: { text: inputParsed.data.text },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead }, { status: 201 });
}
