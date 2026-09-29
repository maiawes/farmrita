-- CÁSSIA Clinical
-- Corrige as permissões de escrita de encounters.
-- Abrir ou alterar um atendimento clínico exige clinical_notes.write.

drop policy if exists
  "authorized users can create encounters"
on public.encounters;

drop policy if exists
  "authorized users can update encounters"
on public.encounters;

create policy "clinical users can create encounters"
on public.encounters
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
    where cu.clinic_id = encounters.clinic_id
      and cu.user_id = encounters.professional_id
      and cu.accepted_at is not null
      and cu.disabled_at is null
  )
);

create policy "clinical users can update encounters"
on public.encounters
for update
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
  )
)
with check (
  public.has_clinic_permission(
    clinic_id,
    'clinical_notes.write'
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