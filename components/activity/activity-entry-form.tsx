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

interface ActivityEntryFormProps {
  leadId: string;
}

export function ActivityEntryForm({ leadId }: ActivityEntryFormProps) {
  const [type, setType] = useState<ActivityType | "">("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;

    setLoading(true);
    await createActivityAction(leadId, type, content || null);
    setType("");
    setContent("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Select value={type} onValueChange={(v) => setType((v ?? "") as ActivityType | "")}>
        <SelectTrigger>
          <SelectValue placeholder="Activity type..." />
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
      />

      <Button type="submit" size="sm" disabled={!type || loading}>
        {loading ? "Saving..." : "Add Activity"}
      </Button>
    </form>
  );
}
