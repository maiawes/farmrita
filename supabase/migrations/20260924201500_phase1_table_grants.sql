-- CÁSSIA Clinical
-- Fase 1: privilégios SQL mínimos para usuários autenticados.
-- RLS continua responsável por decidir quais linhas podem ser acessadas.

grant usage on schema public to authenticated;

-- Leitura necessária para tenancy, RBAC e dashboard autenticado.
grant select on table public.organizations to authenticated;
grant select on table public.clinics to authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.roles to authenticated;
grant select on table public.permissions to authenticated;
grant select on table public.role_permissions to authenticated;
grant select on table public.clinic_users to authenticated;

-- O usuário pode atualizar apenas o próprio profile.
-- A policy RLS já restringe a operação a id = auth.uid().
grant update on table public.profiles to authenticated;

-- Nenhuma tabela da fundação deve ser acessível diretamente por usuário anônimo.
revoke all on table public.organizations from anon;
revoke all on table public.clinics from anon;
revoke all on table public.profiles from anon;
revoke all on table public.roles from anon;
revoke all on table public.permissions from anon;
revoke all on table public.role_permissions from anon;
revoke all on table public.clinic_users from anon;