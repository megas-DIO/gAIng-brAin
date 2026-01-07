create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  capabilities text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'idle',
  capabilities text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists worker_role_assignments (
  worker_id uuid not null references workers(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (worker_id, role_id)
);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_roles_updated_at
  before update on roles
  for each row
  execute function update_updated_at_column();

create trigger update_workers_updated_at
  before update on workers
  for each row
  execute function update_updated_at_column();
