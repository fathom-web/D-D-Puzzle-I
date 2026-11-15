-- Az-Sahar game: all reads and writes go through capability-authorized Edge Function.
-- These tables intentionally have NO public SELECT/INSERT/UPDATE/DELETE policies.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.nom_az_sessions (
  id uuid primary key,
  state jsonb not null,
  revision integer not null default 0 check (revision >= 0),
  dm_token_hash text not null,
  creator_ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists nom_az_sessions_recent on public.nom_az_sessions (created_at desc);
create index if not exists nom_az_sessions_ip on public.nom_az_sessions (creator_ip_hash,created_at desc);

create table if not exists public.nom_az_members (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.nom_az_sessions(id) on delete cascade,
  role text not null check (role in ('quasar','gnarly','kagen','bryndis','vespera','screen')),
  token_hash text not null,
  created_at timestamptz not null default now(),
  unique(session_id,role),
  unique(session_id,token_hash)
);
create index if not exists nom_az_member_access on public.nom_az_members(session_id,token_hash);

alter table public.nom_az_sessions enable row level security;
alter table public.nom_az_members enable row level security;
revoke all privileges on public.nom_az_sessions from public, anon, authenticated;
revoke all privileges on public.nom_az_members from public, anon, authenticated;
-- Only Edge Functions using secret credentials can access these tables.

create or replace function public.nom_az_notify() returns trigger
language plpgsql security invoker
set search_path = ''
as $$
begin
  perform realtime.send(jsonb_build_object('revision',new.revision), 'refresh', 'nom-az-sahar:' || new.id::text, false);
  return new;
end $$;
revoke all on function public.nom_az_notify() from public,anon,authenticated;
drop trigger if exists nom_az_notify_state on public.nom_az_sessions;
create trigger nom_az_notify_state after update of revision on public.nom_az_sessions
for each row when (old.revision is distinct from new.revision)
execute function public.nom_az_notify();

comment on table public.nom_az_sessions is 'Cooperative temple game state. No direct client API access.';
comment on table public.nom_az_members is 'SHA256 hashes of per-role access tokens; raw tokens never stored.';
