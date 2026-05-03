create table public.api_keys (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  key_hash   text not null,   -- SHA-256 hash of the raw key; never store plaintext
  label      text,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

create policy "api keys visible to project owner"
  on public.api_keys for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "api keys manageable by project owner"
  on public.api_keys for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );
