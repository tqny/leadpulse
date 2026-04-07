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
import { Plus, Check, ArrowLeft } from "lucide-react";
import { parseTextNotification } from "@/lib/ingestion/parser";
import type { ParsedLead } from "@/lib/ingestion/schemas";

type Mode = "paste" | "manual";

export function LeadIntakeForm() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("paste");
  const [text, setText] = useState("");
  // Manual entry fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [jobType, setJobType] = useState("");
  const [serviceType, setServiceType] = useState("");
  // Paste preview
  const [preview, setPreview] = useState<ParsedLead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function resetAll() {
    setText("");
    setName("");
    setPhone("");
    setEmail("");
    setCity("");
    setState("");
    setJobType("");
    setServiceType("");
    setPreview(null);
    setError(null);
    setLoading(false);
  }

  function handleParse() {
    setError(null);

    const result = parseTextNotification(text);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setPreview(result.data);
  }

  async function handleConfirmPaste() {
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
      setError(data.details ?? data.error ?? "Failed to create lead");
      return;
    }

    resetAll();
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
      city: city.trim() || null,
      state: state.trim() || null,
      job_type: jobType.trim() || null,
      service_type: serviceType.trim() || null,
      source: "manual",
      status: "new",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    resetAll();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetAll();
      }}
    >
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
            onClick={() => {
              setMode("paste");
              setPreview(null);
              setError(null);
            }}
          >
            Paste Notification
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("manual");
              setPreview(null);
              setError(null);
            }}
          >
            Manual Entry
          </Button>
        </div>

        {mode === "paste" ? (
          preview ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Check className="h-4 w-4 text-secondary" />
                Parsed Fields Preview
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                {[
                  { label: "Name", value: preview.name },
                  { label: "Phone", value: preview.phone },
                  { label: "Email", value: preview.email },
                  { label: "City", value: preview.city },
                  { label: "State", value: preview.state },
                  { label: "Job Type", value: preview.job_type },
                  { label: "Service Type", value: preview.service_type },
                  { label: "Message", value: preview.message },
                ].map(
                  (field) =>
                    field.value && (
                      <div key={field.label} className="flex gap-2 text-sm">
                        <span className="font-medium text-muted-foreground w-24 shrink-0">
                          {field.label}:
                        </span>
                        <span className="text-foreground">{field.value}</span>
                      </div>
                    )
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(null)}
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmPaste}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Confirm & Create Lead"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Paste a Facebook lead notification here...\n\nExample:\nNew Epoxy Bros Meta Ad Lead\nName: John Smith\nNumber: (555) 123-4567\nCity and State: Austin and TX\nJob Type: Residential Garage\nService Type: Full Flake Epoxy`}
                rows={8}
              />
              <Button onClick={handleParse} disabled={!text.trim() || loading}>
                {loading ? "Parsing..." : "Parse & Preview"}
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="lead-name">Name *</Label>
                <Input
                  id="lead-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lead name"
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lead-phone">Phone</Label>
                <Input
                  id="lead-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="focus-visible:ring-2 focus-visible:ring-ring"
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
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lead-city">City</Label>
                <Input
                  id="lead-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Austin"
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lead-state">State</Label>
                <Input
                  id="lead-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="TX"
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lead-job-type">Job Type</Label>
                <Input
                  id="lead-job-type"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  placeholder="Residential Garage"
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lead-service-type">Service Type</Label>
                <Input
                  id="lead-service-type"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="Full Flake Epoxy"
                  className="focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <Button onClick={handleManual} disabled={!name.trim() || loading}>
              {loading ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
