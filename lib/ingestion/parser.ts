import { parsedLeadSchema, type ParsedLead } from "./schemas";

const FIELD_MAP: Record<string, string> = {
  name: "name",
  number: "phone",
  phone: "phone",
  email: "email",
  "city and state": "city_and_state",
  city: "city",
  state: "state",
  "job type": "job_type",
  "service type": "service_type",
  message: "message",
};

function normalizeValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "none") {
    return null;
  }
  return trimmed;
}

export function parseTextNotification(
  text: string
): { success: true; data: ParsedLead } | { success: false; error: string } {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { success: false, error: "Input too short to parse" };
  }

  const fields: Record<string, string | null> = {};

  // Skip header line (first line is typically "New Epoxy Bros Meta Ad Lead" or similar)
  for (let i = 1; i < lines.length; i++) {
    const colonIndex = lines[i].indexOf(": ");
    if (colonIndex === -1) continue;

    const rawKey = lines[i].substring(0, colonIndex).trim().toLowerCase();
    const rawValue = lines[i].substring(colonIndex + 2);
    const mappedKey = FIELD_MAP[rawKey];

    if (!mappedKey) continue;

    if (mappedKey === "city_and_state") {
      const parts = rawValue.split(" and ");
      if (parts.length === 2) {
        fields.city = normalizeValue(parts[0]);
        fields.state = normalizeValue(parts[1]);
      } else {
        fields.city = normalizeValue(rawValue);
        fields.state = null;
      }
    } else {
      fields[mappedKey] = normalizeValue(rawValue);
    }
  }

  const result = parsedLeadSchema.safeParse(fields);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError
        ? `${firstError.path.join(".")}: ${firstError.message}`
        : "Validation failed",
    };
  }

  return { success: true, data: result.data };
}
