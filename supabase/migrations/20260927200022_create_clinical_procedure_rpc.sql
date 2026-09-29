-- CÁSSIA Clinical
-- Criação atômica de procedimento clínico e seus desenhos anatômicos.

create or replace function public.create_clinical_note_procedure(
  p_clinic_id uuid,
  p_patient_id uuid,
  p_encounter_id uuid,
  p_clinical_note_id uuid,
  p_procedure_name text,
  p_procedure_date date,
  p_product_used text default null,
  p_batch_number text default null,
  p_complications text default null,
  p_notes text default null,
  p_diagrams jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_procedure_id uuid;
  diagram_item jsonb;
begin
  if jsonb_typeof(
    coalesce(p_diagrams, '[]'::jsonb)
  ) <> 'array' then
    raise exception
      'p_diagrams must be a JSON array';
  end if;

  insert into public.clinical_note_procedures (
    clinic_id,
    patient_id,
    encounter_id,
    clinical_note_id,
    created_by,
    procedure_name,
    procedure_date,
    product_used,
    batch_number,
    complications,
    notes
  )
  values (
    p_clinic_id,
    p_patient_id,
    p_encounter_id,
    p_clinical_note_id,
    auth.uid(),
    trim(p_procedure_name),
    p_procedure_date,
    nullif(trim(p_product_used), ''),
    nullif(trim(p_batch_number), ''),
    nullif(trim(p_complications), ''),
    nullif(trim(p_notes), '')
  )
  returning id
  into new_procedure_id;

  for diagram_item in
    select value
    from jsonb_array_elements(
      coalesce(p_diagrams, '[]'::jsonb)
    )
  loop
    insert into public.clinical_note_procedure_diagrams (
      procedure_id,
      diagram_type,
      diagram_markup,
      created_by
    )
    values (
      new_procedure_id,
      diagram_item ->> 'diagram_type',
      coalesce(
        diagram_item -> 'diagram_markup',
        '[]'::jsonb
      ),
      auth.uid()
    );
  end loop;

  return new_procedure_id;
end;
$$;

revoke all
on function public.create_clinical_note_procedure(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  date,
  text,
  text,
  text,
  text,
  jsonb
)
from public, anon;

grant execute
on function public.create_clinical_note_procedure(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  date,
  text,
  text,
  text,
  text,
  jsonb
)
to authenticated;