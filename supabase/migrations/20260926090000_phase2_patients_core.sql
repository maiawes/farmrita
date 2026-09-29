-- CÁSSIA Clinical
-- Fase 2: núcleo do cadastro de pacientes.
-- Nenhum dado real deve ser utilizado em desenvolvimento.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.patients (
  id uuid primary key default gen_random_uuid(),

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  full_name text not null
    check (char_length(trim(full_name)) between 2 and 160),

  preferred_name text
    check (
      preferred_name is null
      or char_length(trim(preferred_name)) between 2 and 160
    ),

  birth_date date,

  email text,

  phone text,

  status text not null default 'active'
    check (status in ('active', 'inactive')),

  created_by uuid not null default auth.uid()
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index patients_clinic_id_idx
  on public.patients(clinic_id);

create index patients_clinic_name_idx
  on public.patients(clinic_id, full_name);

create index patients_clinic_status_idx
  on public.patients(clinic_id, status);

create trigger patients_set_updated_at
before update on public.patients
for each row
execute function public.set_updated_at();

alter table public.patients enable row level security;

create policy "authorized users can read patients"
on public.patients
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'patients.read'
  )
);

create policy "authorized users can create patients"
on public.patients
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_clinic_permission(
    clinic_id,
    'patients.write'
  )
);

create policy "authorized users can update patients"
on public.patients
for update
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'patients.write'
  )
)
with check (
  public.has_clinic_permission(
    clinic_id,
    'patients.write'
  )
);

grant select, insert, update
on table public.patients
to authenticated;

revoke all
on table public.patients
from anon;