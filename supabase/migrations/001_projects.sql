create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "select own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);
