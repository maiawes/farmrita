-- CÁSSIA Clinical
-- Separa os desenhos anatômicos dos procedimentos.
-- Cada procedimento pode possuir várias vistas anatômicas independentes.

create table public.clinical_note_procedure_diagrams (
  id uuid primary key default gen_random_uuid(),

  procedure_id uuid not null
    references public.clinical_note_procedures(id)
    on delete cascade,

  diagram_type text not null
    check (
      diagram_type in (
        'face_front',
        'face_left',
        'face_right',
        'body_front',
        'body_left',
        'body_right',
        'body_back'
      )
    ),

  diagram_markup jsonb not null default '[]'::jsonb
    check (
      jsonb_typeof(diagram_markup) = 'array'
    ),

  created_by uuid not null
    default auth.uid()
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clinical_note_procedure_diagrams_procedure_type_unique
    unique (procedure_id, diagram_type)
);

create index clinical_note_procedure_diagrams_procedure_id_idx
  on public.clinical_note_procedure_diagrams(procedure_id);

create index clinical_note_procedure_diagrams_created_by_idx
  on public.clinical_note_procedure_diagrams(created_by);

create trigger clinical_note_procedure_diagrams_set_updated_at
before update on public.clinical_note_procedure_diagrams
for each row
execute function public.set_updated_at();

-- Preserva eventuais desenhos já existentes.
insert into public.clinical_note_procedure_diagrams (
  procedure_id,
  diagram_type,
  diagram_markup,
  created_by,
  created_at,
  updated_at
)
select
  id,
  diagram_type,
  diagram_markup,
  created_by,
  created_at,
  updated_at
from public.clinical_note_procedures;

-- Os desenhos passam a viver na tabela filha.
alter table public.clinical_note_procedures
  drop column diagram_markup,
  drop column diagram_type;

create or replace function
public.prevent_anatomical_diagram_change_when_note_finalized()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_procedure_id uuid;
  parent_status text;
begin
  if tg_op = 'DELETE' then
    target_procedure_id := old.procedure_id;
  else
    target_procedure_id := new.procedure_id;
  end if;

  select cn.status
    into parent_status
  from public.clinical_note_procedures cnp
  join public.clinical_notes cn
    on cn.id = cnp.clinical_note_id
  where cnp.id = target_procedure_id;

  if parent_status = 'finalized' then
    raise exception
      'Clinical note is finalized. Anatomical diagrams cannot be changed.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger clinical_note_procedure_diagrams_protect_finalized
before insert or update or delete
on public.clinical_note_procedure_diagrams
for each row
execute function
public.prevent_anatomical_diagram_change_when_note_finalized();

alter table public.clinical_note_procedure_diagrams
enable row level security;

create policy "authorized users can read procedure diagrams"
on public.clinical_note_procedure_diagrams
for select
to authenticated
using (
  exists (
    select 1
    from public.clinical_note_procedures cnp
    where cnp.id =
      clinical_note_procedure_diagrams.procedure_id
      and public.has_clinic_permission(
        cnp.clinic_id,
        'clinical_notes.read'
      )
  )
);

create policy "authorized users can create procedure diagrams"
on public.clinical_note_procedure_diagrams
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.clinical_note_procedures cnp
    join public.clinical_notes cn
      on cn.id = cnp.clinical_note_id
    where cnp.id =
      clinical_note_procedure_diagrams.procedure_id
      and cn.status = 'draft'
      and public.has_clinic_permission(
        cnp.clinic_id,
        'clinical_notes.write'
      )
  )
);

create policy "creators can update draft procedure diagrams"
on public.clinical_note_procedure_diagrams
for update
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1
    from public.clinical_note_procedures cnp
    join public.clinical_notes cn
      on cn.id = cnp.clinical_note_id
    where cnp.id =
      clinical_note_procedure_diagrams.procedure_id
      and cn.status = 'draft'
      and public.has_clinic_permission(
        cnp.clinic_id,
        'clinical_notes.write'
      )
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.clinical_note_procedures cnp
    join public.clinical_notes cn
      on cn.id = cnp.clinical_note_id
    where cnp.id =
      clinical_note_procedure_diagrams.procedure_id
      and cn.status = 'draft'
      and public.has_clinic_permission(
        cnp.clinic_id,
        'clinical_notes.write'
      )
  )
);

grant select, insert, update
on table public.clinical_note_procedure_diagrams
to authenticated;

revoke all
on table public.clinical_note_procedure_diagrams
from anon;