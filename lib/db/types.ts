export const LEAD_STATUSES = [
  "new",
  "contacted",
  "no_response",
  "proposal",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "facebook_webhook",
  "text_paste",
  "manual",
  "excel_upload",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const ACTIVITY_TYPES = [
  "called",
  "left_voicemail",
  "texted",
  "proposal_sent",
  "follow_up_scheduled",
  "note",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  no_response: "No Response",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  called: "Called",
  left_voicemail: "Left voicemail",
  texted: "Texted",
  proposal_sent: "Proposal sent",
  follow_up_scheduled: "Follow-up scheduled",
  note: "Note added",
};

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  job_type: string | null;
  service_type: string | null;
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  estimated_sqft: number | null;
  quote_amount: number | null;
  notes: string | null;
  follow_up_date: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  content: string | null;
  created_at: string;
}

export interface IngestionEvent {
  id: string;
  lead_id: string | null;
  user_id: string;
  source: string;
  raw_payload: Record<string, unknown>;
  parsed: boolean;
  error: string | null;
  created_at: string;
}
