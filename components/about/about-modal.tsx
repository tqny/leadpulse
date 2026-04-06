"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface AboutModalProps {
  children: React.ReactNode;
}

export function AboutModal({ children }: AboutModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>About This Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-slate-600">
          <Section title="What It Is">
            LeadPulse is a lightweight lead intake and follow-up CRM built for a
            small epoxy flooring contractor. It captures leads from Facebook ads,
            text notifications, and Excel imports, then provides a fast triage
            interface for tracking outreach and managing the sales pipeline.
          </Section>

          <Separator />

          <Section title="The Problem">
            Small contractors lose leads to fragmented communication — texts,
            voicemails, and scattered notes. Every missed response is a missed
            job. LeadPulse solves this by providing one place to capture every
            lead and track every touchpoint.
          </Section>

          <Separator />

          <Section title="Target User">
            A solo founder or owner-operator who is also the salesperson. They
            need to respond to leads within minutes while on job sites, not
            manage a full enterprise CRM.
          </Section>

          <Separator />

          <Section title="What's in v1">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Facebook Lead Ads webhook ingestion</li>
              <li>Text notification paste-to-parse intake</li>
              <li>Excel bulk import with header matching</li>
              <li>Lead table with filters, sorting, urgency indicators</li>
              <li>Lead detail drawer with editable fields</li>
              <li>Activity log per lead</li>
              <li>Dashboard summary strip</li>
              <li>Real-time notifications on new leads</li>
              <li>Demo mode for reviewers</li>
            </ul>
          </Section>

          <Separator />

          <Section title="What's Deferred">
            Multi-source intake (Yelp, Thumbtack), job management, automated
            outreach, advanced analytics, multi-user roles, and dark mode. These
            are explicitly out of scope for v1.
          </Section>

          <Separator />

          <Section title="Tech Stack">
            Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase
            (Postgres + Auth + Realtime), Vercel. No overbuilt backend — just
            clean data flow from ingestion to UI.
          </Section>

          <Separator />

          <Section title="What This Demonstrates">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Product thinking: specific problem, focused solution</li>
              <li>Integration design: webhooks, parsers, traceability</li>
              <li>Data modeling: relational schema, state machine, RLS</li>
              <li>UI craft: fast triage, inline updates, real-time</li>
              <li>Scope discipline: clear MVP, explicit non-goals</li>
            </ul>
          </Section>

          <Separator />

          <p className="text-xs text-slate-400 pt-2">
            Built by Tony Mikityuk as a portfolio artifact.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900 mb-1">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
