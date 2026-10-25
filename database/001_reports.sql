-- Run once in the Supabase SQL editor. Re-running this migration is safe.
-- Enable anonymous sign-ins separately in Authentication > Sign In / Providers.
begin;

create or replace function public.valid_report_labels(value text[])
returns boolean language sql immutable strict set search_path = '' as $$
  select cardinality(value) between 1 and 3
    and not exists (select 1 from unnest(value) label where label is null or label not in
      ('algal_bloom', 'oil_sheen', 'garbage', 'no_visible_pollution', 'unclear'))
    and cardinality(value) = (select count(distinct label) from unnest(value) label)
    and (cardinality(value) = 1 or not value && array['no_visible_pollution', 'unclear']);
$$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  image_path text not null check (image_path = 'reports/' || id::text || '.jpg'),
  labels text[] not null default array['unclear'] check (public.valid_report_labels(labels)),
  evidence text not null check (char_length(btrim(evidence)) between 1 and 240),
  analysis_source text not null check (analysis_source in ('vision', 'manual_fallback', 'mock')),
  status text not null default 'needs_review' check (status in ('needs_review', 'published')),
  is_demo boolean not null default false,
  constraint publication_state check (
    (status = 'needs_review' and published_at is null) or
    (status = 'published' and published_at is not null)
  ),
  constraint sample_provenance check ((analysis_source = 'mock') = is_demo)
);

create index if not exists reports_public_feed on public.reports (is_demo, published_at desc) where status = 'published';
create index if not exists reports_owner on public.reports (owner_id);
alter table public.reports enable row level security;
alter table public.reports force row level security;
revoke all on public.reports from public, anon, authenticated;
grant all on public.reports to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 3145728, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg'];

-- Restrictive policies also block access if a project has an unrelated permissive
-- policy on all buckets. Anonymous Supabase sessions use the authenticated role.
drop policy if exists report_photos_private on storage.objects;
create policy report_photos_private on storage.objects as restrictive
for all to anon, authenticated
using (bucket_id <> 'report-photos') with check (bucket_id <> 'report-photos');

-- The owner comes from a server-verified bearer token, never from client JSON.
-- The row lock makes concurrent/retried publication preserve the original fields
-- and timestamp. Service role is the only role allowed to execute this function.
create or replace function public.publish_report(
  p_id uuid,
  p_owner_id uuid,
  p_labels text[],
  p_evidence text,
  p_latitude double precision,
  p_longitude double precision,
  p_reviewed boolean
) returns setof public.reports
language plpgsql security invoker set search_path = '' as $$
declare
  current_report public.reports%rowtype;
begin
  if p_reviewed is distinct from true then
    raise exception 'Explicit review is required' using errcode = '22023';
  end if;
  select * into current_report from public.reports
    where id = p_id and owner_id = p_owner_id for update;
  if not found then
    raise exception 'Report not found' using errcode = 'P0002';
  end if;
  if current_report.status = 'published' then
    return next current_report;
    return;
  end if;
  if not exists (select 1 from storage.objects
    where bucket_id = 'report-photos' and name = current_report.image_path) then
    raise exception 'Stored photo is missing' using errcode = 'P0001';
  end if;
  update public.reports set
    labels = p_labels,
    evidence = btrim(p_evidence),
    latitude = p_latitude,
    longitude = p_longitude,
    status = 'published',
    published_at = clock_timestamp()
    where id = p_id and owner_id = p_owner_id
    returning * into current_report;
  return next current_report;
end;
$$;

revoke all on function public.publish_report(uuid, uuid, text[], text, double precision, double precision, boolean) from public, anon, authenticated;
grant execute on function public.publish_report(uuid, uuid, text[], text, double precision, double precision, boolean) to service_role;

notify pgrst, 'reload schema';
commit;
