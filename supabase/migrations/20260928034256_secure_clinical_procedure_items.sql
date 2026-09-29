-- CÁSSIA Clinical
-- Hardening de produtos/insumos vinculados a procedimentos.
--
-- O módulo clínico pode consultar somente informações comerciais
-- necessárias ao atendimento.
--
-- Custos de compra, multiplicadores e percentuais internos
-- permanecem protegidos na área administrativa.

-- Remove escrita direta da tabela clínica.
revoke all
on table public.clinical_note_procedure_items
from authenticated;

grant select
on table public.clinical_note_procedure_items
to authenticated;

revoke all
on table public.clinical_note_procedure_items
from anon;


-- Catálogo clínico seguro.
-- Retorna produto, lote e valor sugerido.
-- Nunca retorna custo, multiplicador ou percentual agregado.

create or replace function
public.list_clinical_procedure_catalog(
  p_clinic_id uuid
)
returns table (
  product_id uuid,
  product_name text,
  category text,
  manufacturer text,
  application_type text,
  stock_unit text,
  lot_id uuid,
  batch_number text,
  expiry_date date,
  suggested_unit_value numeric(14, 2)
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception
      'Authentication required.';
  end if;

  if not public.has_clinic_permission(
    p_clinic_id,
    'clinical_notes.write'
  ) then
    raise exception
      'Not authorized to access clinical procedure catalog.';
  end if;

  return query
  select
    p.id,
    p.name,
    p.category,
    p.manufacturer,
    p.application_type,
    p.stock_unit,
    pl.id,
    pl.batch_number,
    pl.expiry_date,
    pricing.suggested_unit_value
  from public.products p
  join public.product_lots pl
    on pl.product_id = p.id
    and pl.clinic_id = p.clinic_id
  join public.product_lot_pricing pricing
    on pricing.lot_id = pl.id
    and pricing.clinic_id = p.clinic_id
  where p.clinic_id = p_clinic_id
    and p.active = true
    and (
      pl.expiry_date is null
      or pl.expiry_date >= current_date
    )
  order by
    p.name,
    pl.expiry_date nulls last,
    pl.batch_number;
end;
$$;

revoke all
on function public.list_clinical_procedure_catalog(uuid)
from public, anon;

grant execute
on function public.list_clinical_procedure_catalog(uuid)
to authenticated;


-- Inclusão segura de item no procedimento.
--
-- A função lê internamente o valor sugerido protegido
-- e grava apenas um snapshot comercial no prontuário.

create or replace function
public.add_clinical_procedure_item(
  p_procedure_id uuid,
  p_product_id uuid,
  p_lot_id uuid,
  p_quantity_used numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  procedure_clinic_id uuid;
  procedure_note_status text;

  product_stock_unit text;

  lot_product_id uuid;
  lot_clinic_id uuid;

  current_suggested_unit_value numeric(14, 2);
  calculated_total numeric(14, 2);

  new_item_id uuid;
begin
  if auth.uid() is null then
    raise exception
      'Authentication required.';
  end if;

  if p_quantity_used is null
     or p_quantity_used <= 0 then
    raise exception
      'Quantity used must be greater than zero.';
  end if;

  select
    cnp.clinic_id,
    cn.status
  into
    procedure_clinic_id,
    procedure_note_status
  from public.clinical_note_procedures cnp
  join public.clinical_notes cn
    on cn.id = cnp.clinical_note_id
  where cnp.id = p_procedure_id;

  if procedure_clinic_id is null then
    raise exception
      'Procedure not found.';
  end if;

  if not public.has_clinic_permission(
    procedure_clinic_id,
    'clinical_notes.write'
  ) then
    raise exception
      'Not authorized to modify this clinical procedure.';
  end if;

  if procedure_note_status <> 'draft' then
    raise exception
      'Procedure items can only be changed while the clinical note is a draft.';
  end if;

  select p.stock_unit
    into product_stock_unit
  from public.products p
  where p.id = p_product_id
    and p.clinic_id = procedure_clinic_id
    and p.active = true;

  if product_stock_unit is null then
    raise exception
      'Active product or supply not found.';
  end if;

  select
    pl.product_id,
    pl.clinic_id
  into
    lot_product_id,
    lot_clinic_id
  from public.product_lots pl
  where pl.id = p_lot_id;

  if lot_product_id is null
     or lot_product_id <> p_product_id
     or lot_clinic_id <> procedure_clinic_id then
    raise exception
      'Selected lot does not belong to the selected product and clinic.';
  end if;

  select pricing.suggested_unit_value
    into current_suggested_unit_value
  from public.product_lot_pricing pricing
  where pricing.lot_id = p_lot_id
    and pricing.clinic_id = procedure_clinic_id;

  if current_suggested_unit_value is null then
    raise exception
      'Selected lot has no suggested value.';
  end if;

  calculated_total :=
    round(
      current_suggested_unit_value
      * p_quantity_used,
      2
    );

  insert into public.clinical_note_procedure_items (
    procedure_id,
    clinic_id,
    product_id,
    lot_id,
    quantity_used,
    stock_unit,
    suggested_unit_value,
    suggested_total_value,
    created_by
  )
  values (
    p_procedure_id,
    procedure_clinic_id,
    p_product_id,
    p_lot_id,
    p_quantity_used,
    product_stock_unit,
    current_suggested_unit_value,
    calculated_total,
    auth.uid()
  )
  returning id
  into new_item_id;

  return new_item_id;
end;
$$;

revoke all
on function public.add_clinical_procedure_item(
  uuid,
  uuid,
  uuid,
  numeric
)
from public, anon;

grant execute
on function public.add_clinical_procedure_item(
  uuid,
  uuid,
  uuid,
  numeric
)
to authenticated;


-- Remoção segura enquanto a nota clínica ainda é rascunho.

create or replace function
public.remove_clinical_procedure_item(
  p_item_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item_clinic_id uuid;
  parent_status text;
begin
  if auth.uid() is null then
    raise exception
      'Authentication required.';
  end if;

  select
    item.clinic_id,
    cn.status
  into
    item_clinic_id,
    parent_status
  from public.clinical_note_procedure_items item
  join public.clinical_note_procedures cnp
    on cnp.id = item.procedure_id
  join public.clinical_notes cn
    on cn.id = cnp.clinical_note_id
  where item.id = p_item_id;

  if item_clinic_id is null then
    raise exception
      'Procedure item not found.';
  end if;

  if not public.has_clinic_permission(
    item_clinic_id,
    'clinical_notes.write'
  ) then
    raise exception
      'Not authorized to modify this clinical procedure.';
  end if;

  if parent_status <> 'draft' then
    raise exception
      'Procedure items cannot be removed after clinical note finalization.';
  end if;

  delete from public.clinical_note_procedure_items
  where id = p_item_id;
end;
$$;

revoke all
on function public.remove_clinical_procedure_item(uuid)
from public, anon;

grant execute
on function public.remove_clinical_procedure_item(uuid)
to authenticated;