-- campaigns table
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template_html text,
  template_text text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sending', 'sent')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- participants table
create table participants (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  email text not null,
  name text not null default '',
  custom_fields jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'bounced')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_participants_campaign_id on participants(campaign_id);
create index idx_participants_status on participants(status);

-- user_settings table
create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  google_oauth_token text,
  rate_limit_delay integer not null default 2,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table campaigns enable row level security;
alter table participants enable row level security;
alter table user_settings enable row level security;

-- For single-user setup, allow authenticated users full access
create policy "Allow authenticated users full access to campaigns"
  on campaigns for all using (auth.role() = 'authenticated');

create policy "Allow authenticated users full access to participants"
  on participants for all using (auth.role() = 'authenticated');

create policy "Allow users to manage their own settings"
  on user_settings for all using (auth.uid() = user_id);
