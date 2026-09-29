-- CÁSSIA Clinical
-- Fundação de produtos, insumos, lotes e formação interna de preço.
--
-- Custos e regras de formação são internos.
-- A futura ficha do paciente receberá somente o valor sugerido/comercial.

create table public.products (
  id uuid primary key default gen_random_uuid(),

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  name text not null
    check (
      char_length(trim(name)) between 1 and 160
    ),

  category text not null
    check (
      char_length(trim(category)) between 1 and 80
    ),

  manufacturer text
    check (
      manufacturer is null
      or char_length(trim(manufacturer)) between 1 and 160
    ),

  application_type text
    check (
      application_type is null
      or char_length(trim(application_type)) between 1 and 120
    ),

  stock_unit text not null
    check (
      char_length(trim(stock_unit)) between 1 and 40
    ),

  active boolean not null default true,

  created_by uuid not null
    default auth.uid()
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_id_clinic_unique
    unique (id, clinic_id)
);

create index products_clinic_id_idx
  on public.products(clinic_id);

create index products_clinic_active_idx
  on public.products(
    clinic_id,
    active
  );

create index products_name_idx
  on public.products(name);

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();


create table public.product_lots (
  id uuid primary key default gen_random_uuid(),

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  product_id uuid not null,

  batch_number text not null
    check (
      char_length(trim(batch_number)) between 1 and 120
    ),

  manufacture_date date,

  expiry_date date,

  purchase_quantity numeric(14, 4) not null
    check (
      purchase_quantity > 0
    ),

  created_by uuid not null
    default auth.uid()
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_lots_product_clinic_fkey
    foreign key (
      product_id,
      clinic_id
    )
    references public.products(
      id,
      clinic_id
    )
    on delete restrict,

  constraint product_lots_id_clinic_unique
    unique (
      id,
      clinic_id
    ),

  constraint product_lots_product_batch_unique
    unique (
      clinic_id,
      product_id,
      batch_number
    ),

  constraint product_lots_dates_check
    check (
      manufacture_date is null
      or expiry_date is null
      or expiry_date >= manufacture_date
    )
);

create index product_lots_clinic_id_idx
  on public.product_lots(clinic_id);

create index product_lots_product_id_idx
  on public.product_lots(product_id);

create index product_lots_expiry_date_idx
  on public.product_lots(expiry_date);

create trigger product_lots_set_updated_at
before update on public.product_lots
for each row
execute function public.set_updated_at();


create table public.product_lot_pricing (
  lot_id uuid primary key,

  clinic_id uuid not null
    references public.clinics(id)
    on delete restrict,

  purchase_total_cost numeric(14, 2) not null
    check (
      purchase_total_cost > 0
    ),

  purchase_unit_cost numeric(16, 6) not null
    default 0
    check (
      purchase_unit_cost >= 0
    ),

  base_multiplier numeric(8, 4) not null
    default 1.5000
    check (
      base_multiplier >= 1
      and base_multiplier <= 10
    ),

  value_added_percent numeric(6, 2) not null
    default 45.00
    check (
      value_added_percent >= 0
      and value_added_percent <= 100
    ),

  suggested_unit_value numeric(14, 2) not null
    default 0
    check (
      suggested_unit_value >= 0
    ),

  created_by uuid not null
    default auth.uid()
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_lot_pricing_lot_clinic_fkey
    foreign key (
      lot_id,
      clinic_id
    )
    references public.product_lots(
      id,
      clinic_id
    )
    on delete cascade
);

create index product_lot_pricing_clinic_id_idx
  on public.product_lot_pricing(clinic_id);


create or replace function
public.calculate_product_lot_pricing()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  lot_purchase_quantity numeric(14, 4);
begin
  select pl.purchase_quantity
    into lot_purchase_quantity
  from public.product_lots pl
  where pl.id = new.lot_id
    and pl.clinic_id = new.clinic_id;

  if lot_purchase_quantity is null
     or lot_purchase_quantity <= 0 then
    raise exception
      'Product lot has no valid purchase quantity.';
  end if;

  new.purchase_unit_cost :=
    round(
      new.purchase_total_cost
      / lot_purchase_quantity,
      6
    );

  new.suggested_unit_value :=
    round(
      new.purchase_unit_cost
      * new.base_multiplier
      * (
        1
        + new.value_added_percent / 100
      ),
      2
    );

  return new;
end;
$$;

create trigger product_lot_pricing_calculate
before insert or update
on public.product_lot_pricing
for each row
execute function
public.calculate_product_lot_pricing();


create trigger product_lot_pricing_set_updated_at
before update
on public.product_lot_pricing
for each row
execute function public.set_updated_at();


alter table public.products
enable row level security;

alter table public.product_lots
enable row level security;

alter table public.product_lot_pricing
enable row level security;


create policy "authorized users can read products"
on public.products
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'inventory.read'
  )
  or public.has_clinic_permission(
    clinic_id,
    'pricing.read'
  )
);


create policy "authorized users can create products"
on public.products
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_clinic_permission(
    clinic_id,
    'inventory.adjust'
  )
);


create policy "authorized users can update products"
on public.products
for update
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'inventory.adjust'
  )
)
with check (
  public.has_clinic_permission(
    clinic_id,
    'inventory.adjust'
  )
);


create policy "authorized users can read product lots"
on public.product_lots
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'inventory.read'
  )
  or public.has_clinic_permission(
    clinic_id,
    'pricing.read'
  )
);


create policy "authorized users can receive product lots"
on public.product_lots
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_clinic_permission(
    clinic_id,
    'inventory.receive'
  )
);


create policy "authorized users can update product lots"
on public.product_lots
for update
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'inventory.adjust'
  )
)
with check (
  public.has_clinic_permission(
    clinic_id,
    'inventory.adjust'
  )
);


create policy "authorized users can read internal pricing"
on public.product_lot_pricing
for select
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'pricing.read'
  )
);


create policy "authorized users can create internal pricing"
on public.product_lot_pricing
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_clinic_permission(
    clinic_id,
    'pricing.manage'
  )
);


create policy "authorized users can update internal pricing"
on public.product_lot_pricing
for update
to authenticated
using (
  public.has_clinic_permission(
    clinic_id,
    'pricing.manage'
  )
)
with check (
  public.has_clinic_permission(
    clinic_id,
    'pricing.manage'
  )
);


grant select, insert, update
on table public.products
to authenticated;

grant select, insert, update
on table public.product_lots
to authenticated;

grant select, insert, update
on table public.product_lot_pricing
to authenticated;


revoke all
on table public.products
from anon;

revoke all
on table public.product_lots
from anon;

revoke all
on table public.product_lot_pricing
from anon;