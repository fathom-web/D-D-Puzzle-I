-- De Stilte van Az-Sahar. Apply through Supabase SQL Editor or migrations.
-- All application data is private to the service-role Edge Function.
create extension if not exists pgcrypto;

create table if not exists public.temple_sessions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z2-9]{7}$'),
  state jsonb not null,
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.temple_tokens (
  token_hash text primary key check (length(token_hash) = 64),
  session_code text references public.temple_sessions(code) on delete cascade,
  role text not null check (role in ('dm','quasar','gnarly','kagen','bryndis','vespera')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Rate limit DM password guesses. IP values are hashed server-side.
create table if not exists public.temple_login_attempts (
  source_hash text primary key,
  failed_count integer not null default 0,
  first_attempt timestamptz not null default now(),
  blocked_until timestamptz
);

create index if not exists temple_tokens_code_idx on public.temple_tokens(session_code);
create index if not exists temple_tokens_expiry_idx on public.temple_tokens(expires_at);
create index if not exists temple_sessions_updated_idx on public.temple_sessions(updated_at desc);

alter table public.temple_sessions enable row level security;
alter table public.temple_tokens enable row level security;
alter table public.temple_login_attempts enable row level security;

-- No public policies: only the Supabase service-role Edge Function may access data.
revoke all on public.temple_sessions from anon, authenticated;
revoke all on public.temple_tokens from anon, authenticated;
revoke all on public.temple_login_attempts from anon, authenticated;
grant all on public.temple_sessions to service_role;
grant all on public.temple_tokens to service_role;
grant all on public.temple_login_attempts to service_role;

comment on table public.temple_sessions is 'Private source-of-truth state for Novus Ordo Mundi puzzle sessions.';
comment on table public.temple_tokens is 'SHA-256 hashes of high-entropy DM/role bearer tokens; no plaintext tokens here.';