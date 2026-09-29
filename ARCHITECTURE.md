# Arquitetura inicial

- Next.js App Router com TypeScript strict e Tailwind.
- Supabase Auth para identidade e sessões.
- Supabase Postgres para dados relacionais, com migrations versionadas e RLS.
- `lib/supabase/client.ts` somente para componentes de navegador.
- `lib/supabase/server.ts` somente para Server Components, Route Handlers e
  Server Actions.
- `proxy.ts` renova a sessão e bloqueia rotas privadas.
- O domínio clínico será implementado em fases, começando por pacientes e
  prontuário após a fundação de tenancy/RBAC.

O dashboard atual contém dados fictícios e não representa dados persistidos.
