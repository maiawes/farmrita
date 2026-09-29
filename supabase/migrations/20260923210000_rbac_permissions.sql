-- CÁSSIA Clinical
-- Fase 1: matriz inicial de RBAC
-- Inclui permissões de estoque, fornecedores e precificação.

insert into public.permissions (code, description)
values
  ('inventory.read', 'Visualizar estoque, lotes, validade e saldo'),
  ('inventory.receive', 'Registrar entrada de insumos e produtos comprados'),
  ('inventory.consume', 'Registrar consumo de insumos vinculado a procedimentos'),
  ('inventory.adjust', 'Registrar perdas, vencimentos e ajustes de estoque'),
  ('suppliers.manage', 'Cadastrar e editar fornecedores'),
  ('pricing.read', 'Visualizar custos e preços'),
  ('pricing.manage', 'Gerenciar parâmetros de precificação e preço praticado')
on conflict (code) do nothing;

with permission_matrix (role_code, permission_code) as (
  values

    -- Owner
    ('owner', 'dashboard.read'),
    ('owner', 'patients.read'),
    ('owner', 'patients.write'),
    ('owner', 'clinical_notes.read'),
    ('owner', 'clinical_notes.write'),
    ('owner', 'photos.read'),
    ('owner', 'photos.write'),
    ('owner', 'billing.read'),
    ('owner', 'members.manage'),
    ('owner', 'inventory.read'),
    ('owner', 'inventory.receive'),
    ('owner', 'inventory.consume'),
    ('owner', 'inventory.adjust'),
    ('owner', 'suppliers.manage'),
    ('owner', 'pricing.read'),
    ('owner', 'pricing.manage'),

    -- Admin
    ('admin', 'dashboard.read'),
    ('admin', 'patients.read'),
    ('admin', 'patients.write'),
    ('admin', 'billing.read'),
    ('admin', 'members.manage'),
    ('admin', 'inventory.read'),
    ('admin', 'inventory.receive'),
    ('admin', 'inventory.consume'),
    ('admin', 'inventory.adjust'),
    ('admin', 'suppliers.manage'),
    ('admin', 'pricing.read'),
    ('admin', 'pricing.manage'),

    -- Reception
    ('reception', 'dashboard.read'),
    ('reception', 'patients.read'),
    ('reception', 'patients.write'),

    -- Clinical
    ('clinical', 'dashboard.read'),
    ('clinical', 'patients.read'),
    ('clinical', 'patients.write'),
    ('clinical', 'clinical_notes.read'),
    ('clinical', 'clinical_notes.write'),
    ('clinical', 'photos.read'),
    ('clinical', 'photos.write'),
    ('clinical', 'inventory.read'),
    ('clinical', 'inventory.consume'),

    -- Finance
    ('finance', 'dashboard.read'),
    ('finance', 'billing.read'),
    ('finance', 'pricing.read'),
    ('finance', 'pricing.manage')
)

insert into public.role_permissions (role_id, permission_id)
select
  r.id,
  p.id
from permission_matrix pm
join public.roles r
  on r.code = pm.role_code
join public.permissions p
  on p.code = pm.permission_code
on conflict (role_id, permission_id) do nothing;