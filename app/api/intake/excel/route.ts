import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { parseExcelRows } from "@/lib/ingestion/excel-parser";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["xlsx", "xls"].includes(ext)) {
    return NextResponse.json(
      { error: "File must be .xlsx or .xls" },
      { status: 400 }
    );
  }

  let rows: (string | number | null)[][];
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: "Empty workbook" }, { status: 400 });
    }
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | null)[][];
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Excel file" },
      { status: 400 }
    );
  }

  if (rows.length < 2) {
    return NextResponse.json(
      { error: "File has no data rows" },
      { status: 400 }
    );
  }

  const { leads, errors } = parseExcelRows(rows);

  // Store ingestion event
  await supabase.from("ingestion_events").insert({
    user_id: user.id,
    source: "excel_upload",
    raw_payload: {
      filename: file.name,
      total_rows: rows.length - 1,
      parsed_count: leads.length,
      error_count: errors.length,
    },
    parsed: leads.length > 0,
    error: errors.length > 0 ? `${errors.length} rows had errors` : null,
  });

  // Bulk insert leads
  let created = 0;
  if (leads.length > 0) {
    const leadsToInsert = leads.map((lead) => ({
      user_id: user.id,
      ...lead,
      source: "excel_upload" as const,
      status: "new" as const,
      raw_payload: { filename: file.name },
    }));

    const { error } = await supabase.from("leads").insert(leadsToInsert);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    created = leads.length;
  }

  return NextResponse.json({ created, errors }, { status: 201 });
}
