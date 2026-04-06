import { z } from "zod";
import { LEAD_STATUSES, LEAD_SOURCES, ACTIVITY_TYPES } from "@/lib/db/types";

// Schema for parsed lead data (shared by all intake paths)
export const parsedLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  job_type: z.string().nullable().optional(),
  service_type: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export type ParsedLead = z.infer<typeof parsedLeadSchema>;

// Facebook webhook verification (GET)
export const fbVerifySchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

// Facebook webhook payload (POST) — simplified for lead ads
export const fbWebhookSchema = z.object({
  object: z.literal("page"),
  entry: z.array(
    z.object({
      id: z.string(),
      time: z.number(),
      changes: z.array(
        z.object({
          field: z.literal("leadgen"),
          value: z.object({
            form_id: z.string(),
            leadgen_id: z.string(),
            created_time: z.number(),
            page_id: z.string(),
            field_data: z.array(
              z.object({
                name: z.string(),
                values: z.array(z.string()),
              })
            ),
          }),
        })
      ),
    })
  ),
});

export type FbWebhookPayload = z.infer<typeof fbWebhookSchema>;

// Text paste input
export const textParseInputSchema = z.object({
  text: z.string().min(1, "Text input is required"),
});

// Lead status update
export const leadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

// Lead fields update (partial)
export const leadFieldsSchema = z.object({
  estimated_sqft: z.number().nullable().optional(),
  quote_amount: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  follow_up_date: z.string().nullable().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
});

// Activity creation
export const createActivitySchema = z.object({
  lead_id: z.string().uuid(),
  type: z.enum(ACTIVITY_TYPES),
  content: z.string().nullable().optional(),
});
