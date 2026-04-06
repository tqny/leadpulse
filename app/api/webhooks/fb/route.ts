import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { fbWebhookSchema, fbVerifySchema } from "@/lib/ingestion/schemas";

// GET — Facebook webhook verification
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = fbVerifySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data["hub.verify_token"] !== process.env.FACEBOOK_VERIFY_TOKEN) {
    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
  }

  return new NextResponse(parsed.data["hub.challenge"], { status: 200 });
}

// POST — Facebook lead webhook
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = fbWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const ownerId = process.env.OWNER_USER_ID!;

  for (const entry of parsed.data.entry) {
    for (const change of entry.changes) {
      const fieldData = change.value.field_data;
      const fields: Record<string, string | null> = {};

      for (const fd of fieldData) {
        const key = fd.name.toLowerCase();
        const value = fd.values[0] ?? null;
        if (key === "full_name" || key === "name") fields.name = value;
        else if (key === "phone_number" || key === "phone") fields.phone = value;
        else if (key === "email") fields.email = value;
        else if (key === "city") fields.city = value;
        else if (key === "state") fields.state = value;
        else if (key === "job_type") fields.job_type = value;
        else if (key === "service_type") fields.service_type = value;
      }

      // Store raw ingestion event
      await supabase.from("ingestion_events").insert({
        user_id: ownerId,
        source: "facebook_webhook",
        raw_payload: body as Record<string, unknown>,
        parsed: !!fields.name,
        error: fields.name ? null : "Missing name field",
      });

      if (fields.name) {
        await supabase.from("leads").insert({
          user_id: ownerId,
          name: fields.name,
          phone: fields.phone ?? null,
          email: fields.email ?? null,
          city: fields.city ?? null,
          state: fields.state ?? null,
          job_type: fields.job_type ?? null,
          service_type: fields.service_type ?? null,
          source: "facebook_webhook",
          status: "new",
          raw_payload: body as Record<string, unknown>,
        });
      }
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
