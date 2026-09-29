-- CÁSSIA Clinical
-- Fase 2: anotações clínicas + desenhos anatômicos estéticos.
-- A nota clínica guarda o contexto do atendimento.
-- Cada procedimento pode ter um desenho anatômico (rosto/corpo),
-- marcações estruturadas e campos próprios de produto, data, lote,
-- intercorrências e observações.
-- Notas finalizadas são imutáveis.
-- Correções posteriores devem ser registradas como nova nota/adendo.

alter table public.encounters
add constraint encounters_id_clinic_patient_unique
unique (id, clinic_id, patient_id);

create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  patient_id uuid not null,

  encounter_id uuid not null,

  author_id uuid not null
    default auth.uid()
    references public.profiles(id)
    on delete restrict,

  note_text text not null
    check (
      char_length(trim(note_text)) between 1 and 50000
    ),

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'finalized'
      )
    ),

  finalized_at timestamptz,

  amends_note_id uuid
    references public.clinical_notes(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clinical_notes_patient_clinic_fkey
    foreign key (patient_id, clinic_id)
    references public.patients(id, clinic_id)
    on delete restrict,

  constraint clinical_notes_encounter_context_fkey
    foreign key (
      encounter_id,
      clinic_id,
      patient_id
    )
    references public.encounters(
      id,
      clinic_id,
      patient_id
    )
    on delete restrict,

  constraint clinical_notes_finalized_at_check
    check (
      (
        status = 'draft'
        and finalized_at is null
      )
      or
      (
        status = 'finalized'
        and finalized_at is not null
      )
    ),

  constraint clinical_notes_context_unique
    unique (id, clinic_id, patient_id, encounter_id)
);

create index clinical_notes_clinic_id_idx
  on public.clinical_notes(clinic_id);

create index clinical_notes_patient_id_idx
  on public.clinical_notes(patient_id);

create index clinical_notes_encounter_id_idx
  on public.clinical_notes(encounter_id);

create index clinical_notes_author_id_idx
  on public.clinical_notes(author_id);

create index clinical_notes_patient_created_at_idx
  on public.clinical_notes(
    patient_id,
    created_at desc
  );

create trigger clinical_notes_set_updated_at
before update on public.clinical_notes
for each row
execute function public.set_updated_at();

create or replace function public.set_clinical_note_finalized_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'finalized'
     and new.finalized_at is null then
    new.finalized_at = now();
  end if;

  if new.status = 'draft' then
    new.finalized_at = null;
  end if;

  return new;
end;
$$;

create trigger clinical_notes_02_set_finalized_at
before insert or update on public.clinical_notes
for each row
execute function public.set_clinical_note_finalized_at();

create or replace function public.prevent_finalized_clinical_note_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = 'finalized' then
    raise exception
      'Finalized clinical notes are immutable. Create an addendum instead.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger clinical_notes_01_protect_finalized
before update or delete on public.clinical_notes
for each row
execute function public.prevent_finalized_clinical_note_mutation();

create table public.clinical_note_procedures (
  id uuid primary key default gen_random_uuid(),

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  patient_id uuid not null,

  encounter_id uuid not null,

  clinical_note_id uuid not null,

  created_by uuid not null
    default auth.uid()
    references public.profiles(id)
    on delete restrict,

  procedure_name text not null
    check (
      char_length(trim(procedure_name)) between 1 and 160
    ),

  diagram_type text not null
    check (
      diagram_type in (
        'face_front',
        'face_left',
        'face_right',
        'body_front',
        'body_back'
      )
    ),

  procedure_date date not null default current_date,

  product_used text
    check (
      product_used is null
      or char_length(trim(product_used)) between 1 and 200
    ),

  batch_number text
    check (
      batch_number is null
      or char_length(trim(batch_number)) between 1 and 120
    ),

  complications text
    check (
      complications is null
      or char_length(complications) <= 4000
    ),

  notes text
    check (
      notes is null
      or char_length(notes) <= 8000
    ),

  diagram_markup jsonb not null default '[]'::jsonb
    check (jsonb_typeof(diagram_markup) = 'array'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clinical_note_procedures_patient_clinic_fkey
    foreign key (patient_id, clinic_id)
    references public.patients(id, clinic_id)
    on delete restrict,

  constraint clinical_note_procedures_encounter_context_fkey
    foreign key (
      encounter_id,
      clinic_id,
      patient_id
    )
    references public.encounters(
      id,
      clinic_id,
      patient_id
    )
    on delete restrict,

  constraint clinical_note_procedures_note_context_fkey
    foreign key (
      clinical_note_id,
      clinic_id,
      patient_id,
      encounter_id
    )
    references public.clinical_notes(
      id,
      clinic_id,
      patient_id,
      encounter_id
    )
    on delete cascade
);

create index clinical_note_procedures_clinic_id_idx
  on public.clinical_note_procedures(clinic_id);

create index clinical_note_procedures_patient_id_idx
  on public.clinical_note_procedures(patient_id);

create index clinical_note_procedures_encounter_id_idx
  on public.clinical_note_procedures(encounter_id);

create index clinical_note_procedures_note_id_idx
  on public.clinical_note_procedures(clinical_note_id);

create index clinical_note_procedures_created_by_idx
  on public.clinical_note_procedures(created_by);

create trigger clinical_note_procedures_set_updated_at
before update on public.clinical_note_procedures
for each row
execute function public.set_updated_at();

create or replace function public.prevent_procedure_change_when_note_finalized()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_note_id uuid;
  parent_status text;
begin
  if tg_op = 'DELETE' then
    target_note_id := old.clinical_note_id;
  else
    target_note_id := new.clinical_note_id;
  end if;

  select cn.status
    into parent_status
  from public.clinical_notes cn
  where cn.id = target_note_id;

  if parent_status = 'finalized' then
    raise exception
      'Clinical note is finalized. Create an addendum instead.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger clinical_note_procedures_01_protect_finalized_parent
before insert or update or delete on public.clinical_note_procedures
for each row
execute function public.prevent_procedure_change_when_note_finalized();

alter table public.clinical_notes
enable row level security;

alter table public.clinical_note_procedures
enable row level security;

create policy "authorized users can read clinical notes"
on public.clinical_notes
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'clinical_notes.read'
  )
);

create policy "authorized users can create clinical notes"
on public.clinical_notes
for insert
to authenticated
with check (
  author_id = auth.uid()

  and public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
  )

  and exists (
    select 1
    from public.clinic_users cu
    where cu.clinic_id = clinical_notes.clinic_id
      and cu.user_id = auth.uid()
      and cu.accepted_at is not null
      and cu.disabled_at is null
  )
);

create policy "authors can update their draft clinical notes"
on public.clinical_notes
for update
to authenticated
using (
  author_id = auth.uid()

  and status = 'draft'

  and public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
  )
)
with check (
  author_id = auth.uid()

  and public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
  )
);

create policy "authorized users can read clinical note procedures"
on public.clinical_note_procedures
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'clinical_notes.read'
  )
);

create policy "authorized users can create clinical note procedures"
on public.clinical_note_procedures
for insert
to authenticated
with check (
  created_by = auth.uid()

  and public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
  )

  and exists (
    select 1
    from public.clinic_users cu
    where cu.clinic_id = clinical_note_procedures.clinic_id
      and cu.user_id = auth.uid()
      and cu.accepted_at is not null
      and cu.disabled_at is null
  )
);

create policy "creators can update draft clinical note procedures"
on public.clinical_note_procedures
for update
to authenticated
using (
  created_by = auth.uid()

  and public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
  )
)
with check (
  created_by = auth.uid()

  and public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
  )
);

grant select, insert, update
on table public.clinical_notes
to authenticated;

grant select, insert, update
on table public.clinical_note_procedures
to authenticated;

revoke all
on table public.clinical_notes
from anon;

revoke all
on table public.clinical_note_procedures
from anon;