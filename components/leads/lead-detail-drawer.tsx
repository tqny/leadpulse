"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadStatusBadge } from "./lead-status-badge";
import { LeadUrgencyBadge } from "./lead-urgency-badge";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ActivityEntryForm } from "@/components/activity/activity-entry-form";
import { updateLeadFields, deleteLead } from "@/lib/actions/leads";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  MessageSquare,
  Mail,
  MoreVertical,
  Trash2,
  MapPin,
  Briefcase,
  Wrench,
  CalendarDays,
  MessageCircle,
  Clock,
  Pencil,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, Activity } from "@/lib/db/types";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  activities: Activity[];
  activitiesLoading?: boolean;
  activitiesError?: boolean;
  onRetryActivities?: () => void;
  open: boolean;
  onClose: () => void;
}

/* ────────── Inline Editable Field ────────── */

function InlineEditField({
  label,
  value,
  displayValue,
  type = "text",
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  displayValue?: string;
  type?: "text" | "number" | "date";
  placeholder: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = useCallback(async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  }, [draft, value, onSave]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") handleCancel();
    },
    [handleSave, handleCancel]
  );

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-24 shrink-0">
          {label}
        </span>
        <Input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-7 text-sm"
          disabled={saving}
        />
        <button
          type="button"
          onClick={handleSave}
          className="text-secondary hover:text-secondary/80 shrink-0"
          aria-label="Save"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCancel}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-2 cursor-pointer hover:bg-[var(--surface-inset)] -mx-2 px-2 py-1 transition-colors border border-transparent hover:border-border"
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setEditing(true);
      }}
    >
      <span className="text-xs text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground flex-1 truncate">
        {displayValue || value || (
          <span className="text-muted-foreground italic">{placeholder}</span>
        )}
      </span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

/* ────────── Inline Editable Textarea ────────── */

function InlineEditTextarea({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const handleSave = useCallback(async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  }, [draft, value, onSave]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  if (editing) {
    return (
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="text-sm"
          disabled={saving}
        />
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={handleSave} disabled={saving} className="h-6 text-xs px-2">
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 text-xs px-2">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer hover:bg-[var(--surface-inset)] -mx-2 px-2 py-1 transition-colors border border-transparent hover:border-border"
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setEditing(true);
      }}
    >
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
      <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
        {value || (
          <span className="text-muted-foreground italic">{placeholder}</span>
        )}
      </p>
    </div>
  );
}

/* ────────── Avatar ────────── */

function LeadAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-14 w-14 flex items-center justify-center bg-primary text-primary-foreground text-lg font-bold shrink-0">
      {initials}
    </div>
  );
}

/* ────────── Contact Action Button ────────── */

function ContactAction({
  href,
  icon: Icon,
  label,
  disabled,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex flex-col items-center gap-1 opacity-40">
        <div className="h-9 w-9 flex items-center justify-center border border-border bg-[var(--surface-inset)]">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    );
  }

  return (
    <a
      href={href}
      className="flex flex-col items-center gap-1 group"
      aria-label={label}
    >
      <div className="h-9 w-9 flex items-center justify-center border border-border bg-elevated hover:bg-accent hover:text-accent-foreground transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </a>
  );
}

/* ────────── Main Drawer ────────── */

export function LeadDetailDrawer({
  lead,
  activities,
  activitiesLoading,
  activitiesError,
  onRetryActivities,
  open,
  onClose,
}: LeadDetailDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    setDeleting(false);
  }, [lead?.id]);

  if (!lead) return null;

  const phone = lead.phone ? formatPhone(lead.phone) : null;
  const rawPhone = lead.phone?.replace(/\D/g, "") ?? "";
  const location = [lead.city, lead.state].filter(Boolean).join(", ");

  async function saveField(field: string, raw: string) {
    if (!lead) return;
    let value: string | number | null = raw || null;
    if (field === "estimated_sqft" || field === "quote_amount") {
      value = raw ? Number(raw) : null;
    }
    const result = await updateLeadFields(lead.id, { [field]: value });
    if (result.error) {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto p-0 bg-elevated">
        {/* ── Header ── */}
        <div className="p-6 pb-4 bg-card border-b border-border">
          <SheetHeader className="mb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <LeadAvatar name={lead.name} />
                <div className="min-w-0">
                  <SheetTitle className="text-lg font-bold truncate">
                    {lead.name}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <LeadStatusBadge leadId={lead.id} status={lead.status} />
                    <LeadUrgencyBadge
                      createdAt={lead.created_at}
                      status={lead.status}
                    />
                  </div>
                </div>
              </div>

              {/* More menu with delete */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!confirmDelete ? (
                    <DropdownMenuItem
                      onClick={() => setConfirmDelete(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete Lead
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={async () => {
                        setDeleting(true);
                        const result = await deleteLead(lead!.id);
                        if (result.success) {
                          toast.success("Lead deleted");
                          onClose();
                        } else {
                          toast.error(result.error ?? "Failed to delete");
                        }
                        setDeleting(false);
                        setConfirmDelete(false);
                      }}
                      disabled={deleting}
                      className="text-destructive focus:text-destructive font-medium"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          {/* ── Contact Actions Bar ── */}
          <div className="flex items-center gap-4 mt-4">
            <ContactAction
              href={`tel:${rawPhone}`}
              icon={Phone}
              label="Call"
              disabled={!lead.phone}
            />
            <ContactAction
              href={`sms:${rawPhone}`}
              icon={MessageSquare}
              label="Text"
              disabled={!lead.phone}
            />
            <ContactAction
              href={`mailto:${lead.email}`}
              icon={Mail}
              label="Email"
              disabled={!lead.email}
            />
          </div>
        </div>

        {/* ── Contact Details (Editable) ── */}
        <div className="p-6 py-4 space-y-1 bg-elevated">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Contact Details
          </h3>
          <InlineEditField
            label="Phone"
            value={lead.phone ?? ""}
            displayValue={phone ?? ""}
            placeholder="Add phone number"
            onSave={(v) => saveField("phone", v)}
          />
          <InlineEditField
            label="Email"
            value={lead.email ?? ""}
            placeholder="Add email"
            onSave={(v) => saveField("email", v)}
          />
          <InlineEditField
            label="City"
            value={lead.city ?? ""}
            placeholder="Add city"
            onSave={(v) => saveField("city", v)}
          />
          <InlineEditField
            label="State"
            value={lead.state ?? ""}
            placeholder="Add state"
            onSave={(v) => saveField("state", v)}
          />
          <InlineEditField
            label="Job Type"
            value={lead.job_type ?? ""}
            placeholder="Add job type"
            onSave={(v) => saveField("job_type", v)}
          />
          <InlineEditField
            label="Service"
            value={lead.service_type ?? ""}
            placeholder="Add service type"
            onSave={(v) => saveField("service_type", v)}
          />
          <div className="pt-1">
            <InlineEditTextarea
              label="Message"
              value={lead.message ?? ""}
              placeholder="Add message..."
              onSave={(v) => saveField("message", v)}
            />
          </div>
          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(lead.created_at)}
            </span>
            <span className="capitalize">{lead.source.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* ── Commercial / Editable Fields ── */}
        <div className="p-6 py-4 space-y-1 bg-card border-y border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Deal Details
          </h3>
          <InlineEditField
            label="Est. Sqft"
            value={lead.estimated_sqft?.toString() ?? ""}
            displayValue={lead.estimated_sqft ? lead.estimated_sqft.toLocaleString() : ""}
            type="number"
            placeholder="Add square footage"
            onSave={(v) => saveField("estimated_sqft", v)}
          />
          <InlineEditField
            label="Quote"
            value={lead.quote_amount?.toString() ?? ""}
            displayValue={lead.quote_amount ? formatCurrency(lead.quote_amount) : ""}
            type="number"
            placeholder="Add quote amount"
            onSave={(v) => saveField("quote_amount", v)}
          />
          <InlineEditField
            label="Follow-up"
            value={lead.follow_up_date ?? ""}
            displayValue={lead.follow_up_date ? formatDate(lead.follow_up_date) : ""}
            type="date"
            placeholder="Set follow-up date"
            onSave={(v) => saveField("follow_up_date", v)}
          />
          <div className="pt-1">
            <InlineEditTextarea
              label="Notes"
              value={lead.notes ?? ""}
              placeholder="Add notes..."
              onSave={(v) => saveField("notes", v)}
            />
          </div>
        </div>

        {/* ── Activity Section ── */}
        <div className="p-6 py-4 space-y-3 bg-elevated">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Activity
          </h3>
          <ActivityEntryForm leadId={lead.id} />
          {activitiesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-7 w-7 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : activitiesError ? (
            <div className="flex flex-col items-center py-6 text-muted-foreground gap-2">
              <AlertCircle className="h-8 w-8 opacity-40" />
              <p className="text-sm">Failed to load activities</p>
              {onRetryActivities && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetryActivities}
                  className="h-7 text-xs"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>
          ) : (
            <ActivityTimeline activities={activities} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ────────── Info Row ────────── */

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      {children}
    </div>
  );
}
