"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LeadStatusBadge } from "./lead-status-badge";
import { LeadUrgencyBadge } from "./lead-urgency-badge";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ActivityEntryForm } from "@/components/activity/activity-entry-form";
import { updateLeadFields } from "@/lib/actions/leads";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils/format";
import type { Lead, Activity } from "@/lib/db/types";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  activities: Activity[];
  open: boolean;
  onClose: () => void;
}

export function LeadDetailDrawer({
  lead,
  activities,
  open,
  onClose,
}: LeadDetailDrawerProps) {
  const [sqft, setSqft] = useState("");
  const [quote, setQuote] = useState("");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setSqft(lead.estimated_sqft?.toString() ?? "");
      setQuote(lead.quote_amount?.toString() ?? "");
      setNotes(lead.notes ?? "");
      setFollowUp(lead.follow_up_date ?? "");
    }
  }, [lead]);

  if (!lead) return null;

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    await updateLeadFields(lead.id, {
      estimated_sqft: sqft ? Number(sqft) : null,
      quote_amount: quote ? Number(quote) : null,
      notes: notes || null,
      follow_up_date: followUp || null,
    });
    setSaving(false);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {lead.name}
            <LeadUrgencyBadge
              createdAt={lead.created_at}
              status={lead.status}
            />
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div>
            <Label className="text-xs text-slate-500">Status</Label>
            <div className="mt-1">
              <LeadStatusBadge leadId={lead.id} status={lead.status} />
            </div>
          </div>

          {/* Lead Info (read-only) */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-900">Lead Info</h3>
            <InfoRow label="Phone" value={lead.phone ? formatPhone(lead.phone) : null} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow
              label="Location"
              value={[lead.city, lead.state].filter(Boolean).join(", ") || null}
            />
            <InfoRow label="Job Type" value={lead.job_type} />
            <InfoRow label="Service Type" value={lead.service_type} />
            {lead.message && <InfoRow label="Message" value={lead.message} />}
            <InfoRow label="Source" value={lead.source.replace(/_/g, " ")} />
            <InfoRow label="Created" value={formatDate(lead.created_at)} />
          </div>

          <Separator />

          {/* Commercial (editable) */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900">Commercial</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sqft" className="text-xs">
                  Est. Sqft
                </Label>
                <Input
                  id="sqft"
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quote" className="text-xs">
                  Quote ($)
                </Label>
                <Input
                  id="quote"
                  type="number"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="follow-up" className="text-xs">
                Follow-up Date
              </Label>
              <Input
                id="follow-up"
                type="date"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes..."
              />
            </div>

            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <Separator />

          {/* Activity */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-900">Activity</h3>
            <ActivityEntryForm leadId={lead.id} />
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
