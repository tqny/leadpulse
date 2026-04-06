"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

type Mode = "paste" | "manual";

export function LeadIntakeForm() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("paste");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePaste() {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/intake/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.details ?? data.error ?? "Failed to parse");
      return;
    }

    setText("");
    setOpen(false);
    router.refresh();
  }

  async function handleManual() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setError(null);
    setLoading(true);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("leads").insert({
      user_id: user.id,
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      source: "manual",
      status: "new",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setName("");
    setPhone("");
    setEmail("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Lead</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "paste" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("paste")}
          >
            Paste Notification
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
          >
            Manual Entry
          </Button>
        </div>

        {mode === "paste" ? (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Paste a Facebook lead notification here...\n\nExample:\nNew Epoxy Bros Meta Ad Lead\nName: John Smith\nNumber: (555) 123-4567\nCity and State: Austin and TX\nJob Type: Residential Garage\nService Type: Full Flake Epoxy`}
              rows={8}
            />
            <Button onClick={handlePaste} disabled={!text.trim() || loading}>
              {loading ? "Parsing..." : "Parse & Create Lead"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="lead-name">Name *</Label>
              <Input
                id="lead-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lead name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <Button onClick={handleManual} disabled={!name.trim() || loading}>
              {loading ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
