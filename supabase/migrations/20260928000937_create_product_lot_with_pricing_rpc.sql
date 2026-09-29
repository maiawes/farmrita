-- CÁSSIA Clinical
-- Criação atômica de lote + formação interna de preço.

create or replace function public.create_product_lot_with_pricing(
  p_clinic_id uuid,
  p_product_id uuid,
  p_batch_number text,
  p_manufacture_date date,
  p_expiry_date date,
  p_purchase_quantity numeric,
  p_purchase_total_cost numeric,
  p_base_multiplier numeric default 1.5000,
  p_value_added_percent numeric default 45.00
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_lot_id uuid;
begin
  if p_purchase_quantity is null
     or p_purchase_quantity <= 0 then
    raise exception
      'Purchase quantity must be greater than zero.';
  end if;

  if p_purchase_total_cost is null
     or p_purchase_total_cost <= 0 then
    raise exception
      'Purchase total cost must be greater than zero.';
  end if;

  if p_base_multiplier < 1
     or p_base_multiplier > 10 then
    raise exception
      'Base multiplier is outside the allowed range.';
  end if;

  if p_value_added_percent < 0
     or p_value_added_percent > 100 then
    raise exception
      'Value added percent is outside the allowed range.';
  end if;

  insert into public.product_lots (
    clinic_id,
    product_id,
    batch_number,
    manufacture_date,
    expiry_date,
    purchase_quantity,
    created_by
  )
  values (
    p_clinic_id,
    p_product_id,
    trim(p_batch_number),
    p_manufacture_date,
    p_expiry_date,
    p_purchase_quantity,
    auth.uid()
  )
  returning id
  into new_lot_id;

  insert into public.product_lot_pricing (
    lot_id,
    clinic_id,
    purchase_total_cost,
    base_multiplier,
    value_added_percent,
    created_by
  )
  values (
    new_lot_id,
    p_clinic_id,
    p_purchase_total_cost,
    p_base_multiplier,
    p_value_added_percent,
    auth.uid()
  );

  return new_lot_id;
end;
$$;

revoke all
on function public.create_product_lot_with_pricing(
  uuid,
  uuid,
  text,
  date,
  date,
  numeric,
  numeric,
  numeric,
  numeric
)
from public, anon;

grant execute
on function public.create_product_lot_with_pricing(
  uuid,
  uuid,
  text,
  date,
  date,
  numeric,
  numeric,
  numeric,
  numeric
)
to authenticated;