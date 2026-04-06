-- LeadPulse initial schema

-- Leads table
create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  phone text,
  email text,
  city text,
  state text,
  job_type text,
  service_type text,
  message text,
  source text not null check (source in ('facebook_webhook', 'text_paste', 'manual', 'excel_upload')),
  status text not null default 'new' check (status in ('new', 'contacted', 'no_response', 'proposal', 'won', 'lost')),
  estimated_sqft numeric,
  quote_amount numeric,
  notes text,
  follow_up_date date,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities table
create table activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  type text not null check (type in ('called', 'left_voicemail', 'texted', 'proposal_sent', 'follow_up_scheduled', 'note')),
  content text,
  created_at timestamptz default now()
);

-- Ingestion events table
create table ingestion_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  user_id uuid references auth.users(id) not null,
  source text not null,
  raw_payload jsonb not null,
  parsed boolean default false,
  error text,
  created_at timestamptz default now()
);

-- RLS policies
alter table leads enable row level security;
create policy "Users can only access their own leads"
  on leads for all
  using (auth.uid() = user_id);

alter table activities enable row level security;
create policy "Users can only access their own activities"
  on activities for all
  using (auth.uid() = user_id);

alter table ingestion_events enable row level security;
create policy "Users can only access their own ingestion events"
  on ingestion_events for all
  using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();
