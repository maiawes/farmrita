-- CÁSSIA Clinical
-- Fase 2: atendimentos / encounters.
-- O encounter guarda o evento de atendimento.
-- Conteúdo clínico detalhado ficará em clinical_notes.

alter table public.patients
add constraint patients_id_clinic_unique
unique (id, clinic_id);

create table public.encounters (
  id uuid primary key default gen_random_uuid(),

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  patient_id uuid not null,

  professional_id uuid not null
    references public.profiles(id)
    on delete restrict,

  status text not null default 'open'
    check (
      status in (
        'open',
        'completed',
        'cancelled'
      )
    ),

  started_at timestamptz not null default now(),

  completed_at timestamptz,

  administrative_notes text
    check (
      administrative_notes is null
      or char_length(administrative_notes) <= 2000
    ),

  created_by uuid not null default auth.uid()
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint encounters_patient_clinic_fkey
    foreign key (patient_id, clinic_id)
    references public.patients(id, clinic_id)
    on delete restrict,

  constraint encounters_completed_at_check
    check (
      status <> 'completed'
      or completed_at is not null
    )
);

create index encounters_clinic_id_idx
  on public.encounters(clinic_id);

create index encounters_patient_id_idx
  on public.encounters(patient_id);

create index encounters_professional_id_idx
  on public.encounters(professional_id);

create index encounters_clinic_started_at_idx
  on public.encounters(clinic_id, started_at desc);

create trigger encounters_set_updated_at
before update on public.encounters
for each row
execute function public.set_updated_at();

alter table public.encounters enable row level security;

create policy "authorized users can read encounters"
on public.encounters
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'patients.read'
  )
);

create policy "authorized users can create encounters"
on public.encounters
for insert
to authenticated
with check (
  created_by = auth.uid()

  and public.has_clinic_permission(
    clinic_id,
    'patients.write'
  )

  and exists (
    select 1
    from public.clinic_users cu
    where cu.clinic_id = encounters.clinic_id
      and cu.user_id = encounters.professional_id
      and cu.accepted_at is not null
      and cu.disabled_at is null
  )
);

create policy "authorized users can update encounters"
on public.encounters
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

  and exists (
    select 1
    from public.clinic_users cu
    where cu.clinic_id = encounters.clinic_id
      and cu.user_id = encounters.professional_id
      and cu.accepted_at is not null
      and cu.disabled_at is null
  )
);

grant select, insert, update
on table public.encounters
to authenticated;

revoke all
on table public.encounters
from anon;