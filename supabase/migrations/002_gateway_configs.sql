create table public.gateway_configs (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  config     jsonb not null default '{"routes":[],"hmac":{"secret":""}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gateway_configs enable row level security;

create policy "config visible to project owner"
  on public.gateway_configs for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "config writable by project owner"
  on public.gateway_configs for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- Auto-create empty config with random HMAC secret when a project is inserted
create or replace function public.create_default_gateway_config()
returns trigger language plpgsql security definer as $$
begin
  insert into public.gateway_configs (project_id, config)
  values (
    new.id,
    jsonb_build_object(
      'project_id', new.id::text,
      'routes', '[]'::jsonb,
      'hmac', jsonb_build_object('secret', encode(gen_random_bytes(32), 'hex'))
    )
  );
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.create_default_gateway_config();
