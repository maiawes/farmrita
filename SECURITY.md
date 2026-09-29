# Segurança

## Fase 1

- A autenticação usa Supabase Auth com e-mail e senha.
- O cadastro público deve permanecer desabilitado no projeto Supabase.
- Convites devem ser emitidos por um fluxo administrativo server-side; a
  `service_role` nunca pode ser enviada ao navegador.
- A sessão deve ser renovada pelo `proxy.ts`, usando `getUser()` para validar a
  identidade no servidor.
- O banco usa RLS e funções `security definer` com `search_path` fixo para
  isolamento de clínica e autorização por permissão.
- Administradores, proprietários, clínicos e financeiros devem configurar MFA
  antes do uso em produção.

## Próximos controles

Adicionar testes negativos de IDOR e isolamento entre clínicas, headers de
segurança/CSP, rate limiting de autenticação, auditoria de eventos sensíveis,
Storage privado e URLs assinadas antes de implementar fotografia clínica.


## Validações de autorização realizadas em desenvolvimento

Foram executados testes manuais de autenticação, tenancy, RLS e RBAC no ambiente
Supabase DEV e na aplicação publicada na Vercel.

Resultados confirmados:

- usuário autenticado sem vínculo com clínica visualiza 0 clínicas;
- usuário vinculado à Clínica Teste B visualiza somente a Clínica Teste B;
- usuário vinculado à CÁSSIA Clinical - Unidade Principal visualiza somente essa clínica;
- não houve exposição cruzada entre Clínica Teste B e CÁSSIA Clinical - Unidade Principal;
- papel `owner` recebeu `dashboard.read`;
- papel `owner` recebeu `photos.read`;
- papel `reception` recebeu `dashboard.read`;
- papel `reception` teve `photos.read` negado;
- usuários novos do Supabase Auth receberam registro correspondente em `profiles`
  por trigger;
- o schema remoto passou em `supabase db lint --linked` sem erros.

Esses testes não substituem testes automatizados. Antes de produção, devem ser
adicionados testes negativos automatizados para isolamento entre clínicas, IDOR,
RBAC e acesso não autorizado a dados clínicos.