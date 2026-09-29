# CÁSSIA Clinical — especificação de implementação

## Escopo atual: Fase 1

Implementar a fundação de dados, autenticação, tenancy, RBAC e RLS:

- login por e-mail e senha;
- acesso somente por convite;
- recuperação de senha;
- MFA obrigatório para administradores antes da produção;
- organizações, clínicas, perfis e memberships;
- roles, permissions e role permissions;
- proteção de rotas e sessão por cookies;
- isolamento entre clínicas;
- dashboard inicial sem dados clínicos reais.

## Fase 2 — Pacientes e prontuário eletrônico

Objetivo: implementar o núcleo do cadastro de pacientes e documentação clínica,
preservando isolamento por clínica, RBAC, RLS, versionamento e rastreabilidade.

### Pacientes

Implementar cadastro de pacientes vinculado obrigatoriamente a uma clínica.

Cada paciente deve possuir identificador UUID e dados cadastrais básicos.

Nenhum paciente pode existir sem `clinic_id`.

O acesso deve respeitar:

- `patients.read`
- `patients.write`
- isolamento por clínica via RLS
- deny-by-default

Usuário de uma clínica nunca pode consultar pacientes de outra clínica.

### Timeline clínica

Cada paciente deve possuir uma timeline cronológica capaz de agregar eventos
relevantes do prontuário.

A timeline deve permitir futuramente integrar:

- atendimentos;
- anotações clínicas;
- formulários;
- procedimentos;
- fotografias;
- consentimentos;
- documentos;
- follow-ups.

### Encounters

Criar entidade `encounters` para representar atendimentos clínicos.

Cada atendimento deve estar vinculado a:

- paciente;
- clínica;
- profissional responsável;
- data e hora;
- status;
- observações administrativas quando aplicável.

### Clinical notes

Criar estrutura de anotações clínicas vinculadas ao atendimento.

As anotações devem preservar autoria, data/hora e vínculo com paciente e clínica.

Permissões:

- `clinical_notes.read`
- `clinical_notes.write`

Reception e Finance não devem receber acesso a anotações clínicas.

Registros clínicos finalizados não devem ser silenciosamente sobrescritos.
Correções futuras devem utilizar versionamento ou adendos.

### Motor de formulários

Criar estrutura para formulários clínicos configuráveis e versionados.

Deve permitir:

- templates de formulários;
- versões de templates;
- respostas vinculadas ao paciente;
- respostas vinculadas ao atendimento quando aplicável;
- preservação da versão usada no momento do preenchimento.

### Anamnese

A anamnese deve utilizar o motor de formulários, evitando estrutura paralela
desnecessária.

Nenhuma resposta clínica deve ser armazenada em `localStorage`.

### Auditoria

Registrar eventos básicos relacionados a:

- criação de paciente;
- alteração cadastral;
- criação de atendimento;
- criação e atualização permitida de notas;
- preenchimento de formulários.

A auditoria deve preservar:

- usuário;
- clínica;
- entidade afetada;
- ação;
- data/hora.

### Segurança e dados

Todas as novas tabelas devem:

- utilizar UUID;
- carregar `clinic_id` quando houver dado pertencente à clínica;
- possuir RLS;
- negar acesso por padrão;
- utilizar somente dados fictícios em desenvolvimento.

Nenhuma fotografia clínica deve ser implementada nesta fase.

Antes de considerar a Fase 2 concluída:

1. executar lint;
2. executar typecheck;
3. executar testes relevantes;
4. executar build;
5. testar isolamento entre clínicas;
6. testar permissões negativas;
7. atualizar a documentação.

## Fases posteriores

1. Pacientes e prontuário.
2. Fotografia clínica em Storage privado.
3. Face Aesthetic Planner.
4. Glute Aesthetic Planner.
5. Procedimentos, produtos e estoque.
6. Consentimentos e documentos.
7. Agenda, financeiro e portal.
8. Security hardening, privacidade e preparação para produção.

Nenhuma fase posterior deve ignorar as regras de `AGENTS.md`, `SECURITY.md` e
`PRIVACY.md`.


## Regras permanentes de estoque e precificação

O módulo de estoque deve registrar insumos e produtos comprados, fornecedores,
lotes, validade, custo de aquisição e movimentações de estoque.

O saldo de estoque não deve depender de um único campo editável `stock`.
O saldo deve ser consequência de um ledger de movimentações, incluindo:

- entrada por compra;
- consumo em procedimento;
- ajuste positivo;
- ajuste negativo;
- perda;
- vencimento;
- devolução, quando aplicável.

Cada lote deve preservar rastreabilidade de:

- produto;
- fornecedor;
- lote;
- data de entrada;
- validade;
- quantidade recebida;
- unidade;
- custo total;
- custo unitário.

### Permissões de estoque

- `inventory.read`: visualizar estoque, lotes, validade e saldo.
- `inventory.receive`: registrar entrada de insumos e produtos comprados.
- `inventory.consume`: registrar consumo vinculado a procedimentos.
- `inventory.adjust`: registrar perdas, vencimentos e ajustes.
- `suppliers.manage`: cadastrar e editar fornecedores.

### Precificação

O sistema deve calcular um preço mínimo de referência a partir do custo.

Regra padrão:

`preço mínimo = custo unitário × 1,50`

Esse cálculo representa acréscimo de 50% sobre o custo e não margem de 50%
sobre o preço de venda.

A interface deve exibir separadamente:

- custo unitário;
- percentual de acréscimo;
- preço mínimo calculado;
- preço praticado.

O percentual padrão deve ser 50%, podendo ser alterado apenas por usuário com
permissão adequada.

Permissões:

- `pricing.read`: visualizar custos e preços.
- `pricing.manage`: alterar parâmetros de precificação e preço praticado.

O custo original de aquisição nunca deve ser alterado apenas para produzir
outro preço de venda.


## Matriz inicial de RBAC

A política padrão deve seguir privilégio mínimo.

| Permissão | Owner | Admin | Reception | Clinical | Finance |
|---|---|---|---|---|---|
| dashboard.read | Sim | Sim | Sim | Sim | Sim |
| patients.read | Sim | Sim | Sim | Sim | Não |
| patients.write | Sim | Sim | Sim | Sim | Não |
| clinical_notes.read | Sim | Não | Não | Sim | Não |
| clinical_notes.write | Sim | Não | Não | Sim | Não |
| photos.read | Sim | Não | Não | Sim | Não |
| photos.write | Sim | Não | Não | Sim | Não |
| billing.read | Sim | Sim | Não | Não | Sim |
| members.manage | Sim | Sim | Não | Não | Não |
| inventory.read | Sim | Sim | Não | Sim | Não |
| inventory.receive | Sim | Sim | Não | Não | Não |
| inventory.consume | Sim | Sim | Não | Sim | Não |
| inventory.adjust | Sim | Sim | Não | Não | Não |
| suppliers.manage | Sim | Sim | Não | Não | Não |
| pricing.read | Sim | Sim | Não | Não | Sim |
| pricing.manage | Sim | Sim | Não | Não | Sim |

Regras adicionais:

- Reception não deve acessar anotações clínicas nem fotografias clínicas.
- Finance não deve acessar pacientes, anotações clínicas ou fotografias clínicas.
- Clinical não deve alterar preços nem ajustes administrativos de estoque.
- Owner possui acesso integral dentro da organização.
- Admin possui acesso administrativo, financeiro, estoque e cadastro de pacientes,
  mas não recebe acesso automático a anotações clínicas ou fotografias clínicas.
- Novas permissões devem seguir deny-by-default.