"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS, type ActivityType } from "@/lib/db/types";
import { createActivityAction } from "@/lib/actions/activities";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface ActivityEntryFormProps {
  leadId: string;
}

export function ActivityEntryForm({ leadId }: ActivityEntryFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<ActivityType | "">("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;

    setLoading(true);
    const result = await createActivityAction(leadId, type, content || null);
    if (result.error) {
      toast.error(result.error);
    } else {
      setType("");
      setContent("");
      setExpanded(false);
    }
    setLoading(false);
  }

  if (!expanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground h-8 px-2"
        onClick={() => setExpanded(true)}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Log Activity
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 border border-border bg-[var(--surface-inset)] p-3"
    >
      <Select value={type} onValueChange={(v) => setType((v ?? "") as ActivityType | "")}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Select activity type..." />
        </SelectTrigger>
        <SelectContent>
          {ACTIVITY_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {ACTIVITY_TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note (optional)"
        rows={2}
        className="text-sm resize-none"
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!type || loading} className="h-7 text-xs px-3">
          {loading ? "Saving..." : "Add"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs px-3"
          onClick={() => {
            setExpanded(false);
            setType("");
            setContent("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
