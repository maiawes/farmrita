create extension if not exists "pgcrypto";

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9_]{1,63}$'),
  name text not null unique,
  requires_mfa boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.clinic_users (
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  disabled_at timestamptz,
  primary key (clinic_id, user_id)
);

create index clinics_organization_id_idx on public.clinics(organization_id);
create index clinic_users_user_id_idx on public.clinic_users(user_id);
create index clinic_users_role_id_idx on public.clinic_users(role_id);

create or replace function public.is_clinic_member(target_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clinic_users
    where clinic_id = target_clinic_id
      and user_id = auth.uid()
      and accepted_at is not null
      and disabled_at is null
  );
$$;

create or replace function public.has_clinic_permission(target_clinic_id uuid, required_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clinic_users cu
    join public.role_permissions rp on rp.role_id = cu.role_id
    join public.permissions p on p.id = rp.permission_id
    where cu.clinic_id = target_clinic_id
      and cu.user_id = auth.uid()
      and cu.accepted_at is not null
      and cu.disabled_at is null
      and p.code = required_permission
  );
$$;

revoke all on function public.is_clinic_member(uuid) from public;
revoke all on function public.has_clinic_permission(uuid, text) from public;
grant execute on function public.is_clinic_member(uuid) to authenticated;
grant execute on function public.has_clinic_permission(uuid, text) to authenticated;

alter table public.organizations enable row level security;
alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.clinic_users enable row level security;

create policy "members can read their organizations"
on public.organizations for select to authenticated
using (exists (
  select 1 from public.clinics c
  where c.organization_id = organizations.id
    and public.is_clinic_member(c.id)
));

create policy "members can read their clinics"
on public.clinics for select to authenticated
using (public.is_clinic_member(id));

create policy "users can read their own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "users can update their own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "members can read roles used by their clinics"
on public.roles for select to authenticated
using (exists (
  select 1 from public.clinic_users cu
  where cu.role_id = roles.id and public.is_clinic_member(cu.clinic_id)
));

create policy "members can read permissions used by their clinics"
on public.permissions for select to authenticated
using (exists (
  select 1
  from public.role_permissions rp
  join public.clinic_users cu on cu.role_id = rp.role_id
  where rp.permission_id = permissions.id
    and public.is_clinic_member(cu.clinic_id)
));

create policy "members can read role permissions for their clinics"
on public.role_permissions for select to authenticated
using (exists (
  select 1 from public.clinic_users cu
  where cu.role_id = role_permissions.role_id
    and public.is_clinic_member(cu.clinic_id)
));

create policy "users can read their clinic memberships"
on public.clinic_users for select to authenticated
using (user_id = auth.uid() and accepted_at is not null and disabled_at is null);

insert into public.roles (code, name, requires_mfa)
values
  ('owner', 'Proprietária', true),
  ('admin', 'Administradora', true),
  ('reception', 'Recepção', false),
  ('clinical', 'Clínico', true),
  ('finance', 'Financeiro', true)
on conflict (code) do nothing;

insert into public.permissions (code, description)
values
  ('dashboard.read', 'Visualizar o dashboard'),
  ('patients.read', 'Visualizar pacientes'),
  ('patients.write', 'Gerenciar pacientes'),
  ('clinical_notes.read', 'Visualizar anotações clínicas'),
  ('clinical_notes.write', 'Gerenciar anotações clínicas'),
  ('photos.read', 'Visualizar fotografias clínicas'),
  ('photos.write', 'Gerenciar fotografias clínicas'),
  ('billing.read', 'Visualizar informações financeiras'),
  ('members.manage', 'Gerenciar membros da clínica')
on conflict (code) do nothing;
