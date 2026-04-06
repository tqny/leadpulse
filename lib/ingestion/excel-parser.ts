import { parsedLeadSchema, type ParsedLead } from "./schemas";

const HEADER_MAP: Record<string, string> = {
  name: "name",
  phone: "phone",
  number: "phone",
  email: "email",
  city: "city",
  state: "state",
  "city and state": "city_and_state",
  "job type": "job_type",
  "service type": "service_type",
  message: "message",
};

export interface ExcelParseResult {
  leads: ParsedLead[];
  errors: { row: number; message: string }[];
}

export function parseExcelRows(rows: (string | number | null)[][]): ExcelParseResult {
  if (rows.length < 2) {
    return { leads: [], errors: [{ row: 0, message: "No data rows found" }] };
  }

  // First row is headers
  const headers = rows[0].map((h) =>
    String(h ?? "")
      .trim()
      .toLowerCase()
  );

  // Map header indices to field names
  const columnMap: { index: number; field: string }[] = [];
  for (let i = 0; i < headers.length; i++) {
    const mapped = HEADER_MAP[headers[i]];
    if (mapped) {
      columnMap.push({ index: i, field: mapped });
    }
  }

  if (columnMap.length === 0) {
    return {
      leads: [],
      errors: [{ row: 1, message: "No recognized column headers found" }],
    };
  }

  const leads: ParsedLead[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const fields: Record<string, string | null> = {};

    for (const { index, field } of columnMap) {
      const raw = row[index];
      const value =
        raw === null || raw === undefined || String(raw).trim() === ""
          ? null
          : String(raw).trim();

      if (value && value.toLowerCase() === "none") {
        fields[field] = null;
        continue;
      }

      if (field === "city_and_state" && value) {
        const parts = value.split(" and ");
        if (parts.length === 2) {
          fields.city = parts[0].trim() || null;
          fields.state = parts[1].trim() || null;
        } else {
          fields.city = value;
          fields.state = null;
        }
      } else {
        fields[field] = value;
      }
    }

    // Skip entirely empty rows
    if (Object.values(fields).every((v) => v === null || v === undefined)) {
      continue;
    }

    // Row number is 1-indexed for user display (header is row 1, first data row is row 2)
    const displayRow = r + 1;

    if (!fields.name) {
      errors.push({ row: displayRow, message: "Missing required field: Name" });
      continue;
    }

    const result = parsedLeadSchema.safeParse(fields);
    if (!result.success) {
      const msg = result.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      errors.push({ row: displayRow, message: msg });
      continue;
    }

    leads.push(result.data);
  }

  return { leads, errors };
}
