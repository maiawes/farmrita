# Banco de dados

As migrations ficam em `supabase/migrations` e devem ser aplicadas somente ao
projeto de desenvolvimento até a revisão de produção.

O isolamento é feito por `clinic_users` e pelas funções `is_clinic_member` e
`has_clinic_permission`. Novas tabelas clínicas devem carregar `clinic_id`,
habilitar RLS na mesma migration e referenciar essas funções nas políticas.

A migration inicial cria organizações, clínicas, perfis, memberships, papéis e
permissões. O Supabase Auth permanece a fonte de identidade; `profiles` contém
somente dados de aplicação.
