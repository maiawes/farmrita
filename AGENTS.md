# CÁSSIA Clinical

Leia `PRODUCT_SPEC.md` antes de mudanças arquiteturais e consulte `SECURITY.md` e
`PRIVACY.md` em qualquer funcionalidade que envolva dados clínicos.

## Regras obrigatórias

- Trate dados clínicos como sensíveis e use somente dados fictícios em desenvolvimento.
- Nunca exponha chaves `service_role` no cliente ou no repositório.
- Toda tabela Supabase deve ter RLS habilitado e políticas deny-by-default.
- Nunca use buckets públicos para fotografias clínicas.
- Nunca armazene dados clínicos em `localStorage`.
- Não permita cadastro público: contas entram por convite.
- Perfis administrativos devem exigir MFA antes de produção.
- Não sobrescreva registros clínicos finalizados; use versões ou adendos.
- Não gere doses, pontos de injeção ou prescrições.

Antes de concluir uma tarefa, execute lint, typecheck, testes relevantes e build.
