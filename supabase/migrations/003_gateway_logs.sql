create table public.gateway_logs (
  id          bigserial primary key,
  project_id  uuid not null references public.projects(id) on delete cascade,
  route_path  text,
  method      text,
  status_code int,
  latency_ms  int,
  ip          text,
  created_at  timestamptz not null default now()
);

alter table public.gateway_logs enable row level security;

create policy "logs visible to project owner"
  on public.gateway_logs for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- Gateway writes logs with service role key (bypasses RLS)
-- No insert policy needed for user-facing clients

create index gateway_logs_project_created
  on public.gateway_logs(project_id, created_at desc);
