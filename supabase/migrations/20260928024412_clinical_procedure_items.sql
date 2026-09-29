-- CÁSSIA Clinical
-- Produtos e insumos utilizados em procedimentos.
--
-- Custos, multiplicadores e percentuais internos NÃO são expostos
-- ao módulo clínico. O prontuário recebe somente snapshots dos
-- valores sugeridos no momento do uso.

alter table public.product_lots
add constraint product_lots_id_clinic_product_unique
unique (
  id,
  clinic_id,
  product_id
);


create table public.clinical_note_procedure_items (
  id uuid primary key default gen_random_uuid(),

  procedure_id uuid not null
    references public.clinical_note_procedures(id)
    on delete cascade,

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  product_id uuid not null,

  lot_id uuid not null,

  quantity_used numeric(14, 4) not null
    check (
      quantity_used > 0
    ),

  stock_unit text not null
    check (
      char_length(trim(stock_unit)) between 1 and 40
    ),

  suggested_unit_value numeric(14, 2) not null
    check (
      suggested_unit_value >= 0
    ),

  suggested_total_value numeric(14, 2) not null
    check (
      suggested_total_value >= 0
    ),

  created_by uuid not null
    default auth.uid()
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clinical_procedure_items_product_clinic_fkey
    foreign key (
      product_id,
      clinic_id
    )
    references public.products(
      id,
      clinic_id
    )
    on delete restrict,

  constraint clinical_procedure_items_lot_context_fkey
    foreign key (
      lot_id,
      clinic_id,
      product_id
    )
    references public.product_lots(
      id,
      clinic_id,
      product_id
    )
    on delete restrict,

  constraint clinical_procedure_items_procedure_lot_unique
    unique (
      procedure_id,
      lot_id
    )
);


create index clinical_procedure_items_procedure_id_idx
  on public.clinical_note_procedure_items(procedure_id);

create index clinical_procedure_items_product_id_idx
  on public.clinical_note_procedure_items(product_id);

create index clinical_procedure_items_lot_id_idx
  on public.clinical_note_procedure_items(lot_id);

create index clinical_procedure_items_clinic_id_idx
  on public.clinical_note_procedure_items(clinic_id);


create trigger clinical_procedure_items_set_updated_at
before update
on public.clinical_note_procedure_items
for each row
execute function public.set_updated_at();


create or replace function
public.prevent_procedure_item_change_when_note_finalized()
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
      'Clinical note is finalized. Procedure items cannot be changed.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;


create trigger clinical_procedure_items_protect_finalized
before insert or update or delete
on public.clinical_note_procedure_items
for each row
execute function
public.prevent_procedure_item_change_when_note_finalized();


create or replace function
public.enforce_max_ten_procedures_per_note()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  procedure_count integer;
begin
  select count(*)
    into procedure_count
  from public.clinical_note_procedures
  where clinical_note_id = new.clinical_note_id;

  if procedure_count >= 10 then
    raise exception
      'A clinical note can contain at most 10 procedures.';
  end if;

  return new;
end;
$$;


create trigger clinical_note_procedures_max_ten
before insert
on public.clinical_note_procedures
for each row
execute function
public.enforce_max_ten_procedures_per_note();


alter table public.clinical_note_procedure_items
enable row level security;


create policy "authorized users can read procedure items"
on public.clinical_note_procedure_items
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'clinical_notes.read'
  )
);


grant select
on table public.clinical_note_procedure_items
to authenticated;

revoke insert, update, delete
on table public.clinical_note_procedure_items
from authenticated;

revoke all
on table public.clinical_note_procedure_items
from anon;


-- Catálogo clínico seguro.
--
-- Retorna somente identificação do produto/lote e valor sugerido.
-- Não retorna custo de compra, multiplicador nem percentual agregado.

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
  if auth.uid() is null
     or not public.has_clinic_permission(
       p_clinic_id,
       'clinical_notes.write'
     ) then
    raise exception
      'Not authorized to access the clinical procedure catalog.';
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


-- Inclusão segura de produto/insumo em procedimento.
--
-- A função lê internamente o valor sugerido protegido e grava
-- apenas seu snapshot comercial no prontuário.

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
      'The selected lot does not belong to the selected product and clinic.';
  end if;

  select pricing.suggested_unit_value
    into current_suggested_unit_value
  from public.product_lot_pricing pricing
  where pricing.lot_id = p_lot_id
    and pricing.clinic_id = procedure_clinic_id;

  if current_suggested_unit_value is null then
    raise exception
      'The selected lot has no suggested value.';
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


-- Remoção segura enquanto a nota ainda é rascunho.

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