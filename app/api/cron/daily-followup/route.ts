import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendSms } from "@/lib/twilio/client";
import { STATUS_LABELS, type LeadStatus } from "@/lib/db/types";

const MAX_LEADS_IN_SMS = 5;
const APP_URL = "https://leadpulse-one.vercel.app";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check feature flag
  if (process.env.SMS_REMINDERS_ENABLED !== "true") {
    return NextResponse.json({ skipped: "disabled" });
  }

  const toPhone = process.env.TWILIO_TO_PHONE;
  if (!toPhone) {
    console.error("[daily-followup] Missing TWILIO_TO_PHONE");
    return NextResponse.json(
      { error: "Missing TWILIO_TO_PHONE" },
      { status: 500 }
    );
  }

  // Query leads with follow-ups due today
  const today = new Date().toISOString().split("T")[0];
  const supabase = createServiceClient();

  const { data: leads, error: dbError } = await supabase
    .from("leads")
    .select("name, status, job_type, quote_amount")
    .eq("follow_up_date", today)
    .eq("user_id", process.env.OWNER_USER_ID!)
    .not("status", "in", '("won","lost")')
    .order("created_at", { ascending: true });

  if (dbError) {
    console.error("[daily-followup] DB query failed:", dbError.message);
    return NextResponse.json(
      { error: "Database query failed", details: dbError.message },
      { status: 500 }
    );
  }

  if (!leads || leads.length === 0) {
    console.log("[daily-followup] No follow-ups due today");
    return NextResponse.json({ skipped: "no_followups" });
  }

  // Format SMS body
  const body = formatSmsBody(leads);

  // Send SMS
  const result = await sendSms(toPhone, body);

  if (!result.success) {
    console.error("[daily-followup] SMS send failed:", result.error);
    return NextResponse.json(
      { error: "SMS send failed", details: result.error },
      { status: 500 }
    );
  }

  console.log(
    `[daily-followup] SMS sent (${result.sid}) — ${leads.length} follow-ups`
  );

  return NextResponse.json({
    sent: true,
    sid: result.sid,
    followUpCount: leads.length,
  });
}

interface LeadRow {
  name: string;
  status: LeadStatus;
  job_type: string | null;
  quote_amount: number | null;
}

function formatSmsBody(leads: LeadRow[]): string {
  const count = leads.length;
  const lines: string[] = [
    `LeadPulse: ${count} follow-up${count === 1 ? "" : "s"} due today`,
    "",
  ];

  const shown = leads.slice(0, MAX_LEADS_IN_SMS);
  for (const lead of shown) {
    const status = STATUS_LABELS[lead.status] ?? lead.status;
    const detail = lead.quote_amount
      ? `$${lead.quote_amount.toLocaleString()}`
      : lead.job_type ?? "";
    const suffix = detail ? ` - ${detail}` : "";
    lines.push(`- ${lead.name} (${status})${suffix}`);
  }

  if (count > MAX_LEADS_IN_SMS) {
    lines.push(`...and ${count - MAX_LEADS_IN_SMS} more`);
  }

  lines.push("", `${APP_URL}/leads?followUp=today`);

  return lines.join("\n");
}
