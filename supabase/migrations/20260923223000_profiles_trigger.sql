-- CÁSSIA Clinical
-- Fase 1: sincronização entre Supabase Auth e public.profiles

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      'Usuário'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Backfill de usuários que já existiam antes desta migration.
insert into public.profiles (
  id,
  full_name
)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    'Usuário'
  )
from auth.users u
on conflict (id) do nothing;