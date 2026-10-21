# Status da entrega

> Preencha este arquivo na branch `main` antes de entregar.

**Nome:** Heber Silverio
**Tempo total gasto (aprox.):** 1h24m03s (registrado com Clockify)

## Ordem em que trabalhei

Comecei pela **Tarefa 3 (🟥 urgente)** por dois motivos: ela é o único item
marcado como urgente no enunciado e é o problema com maior gravidade — vazamento
de dados entre empresas, com impacto direto na segurança/LGPD. Além disso, é a
única tarefa cuja correção fica no banco (`sql/schema.sql`), e portanto
independe das demais: dá para validá-la e fechar a branch sem depender de
nenhuma outra entrega.

Depois dela pretendo seguir a ordem de impacto para o cliente: **Tarefa 1**
(tela inutilizável para o Grupo Aurora), **Tarefa 2** (número financeiro
errado — R$ 4.501,00 em vez de R$ 3.400,50), **Tarefa 4** (prazo em dias
úteis, que depende de escolher e consultar a API de feriados) e por fim
**Tarefa 5** (exportação para o Excel, que depende da lista final exibida na
tela para fazer sentido).

## Ferramentas utilizadas

- **Auxílio de IA:** sim, liberado pelo enunciado.
- **Ferramenta de IA:** Cline (extensão do VS Code).
- **Modelo utilizado:** `cline:cline-free/nemotron-3.5-super-vl` e o modelo
  pago `kimi-k3` (Moonshot AI).
- **Gerenciamento de tempo:** Clockify, com duas entradas registradas:
  - Prova prática - monteirocorp-ai (Preparação e diagnóstico) — 00:31:02
  - Prova prática - monteirocorp-ai (Tarefa 3 — Segurança) — 00:53:01
- Todo o histórico das conversas com a IA está sendo salvo na pasta `sessoes/`.

## Tarefa 1 — Tela de tarefas

- **Situação:** não comecei
- **Qual era o problema:** a tela não mostra nada ao escolher o Grupo Aurora
  (nenhuma tarefa pertence diretamente à empresa 1) e o filtro de período
  exclui os dias das pontas (usa `>` e `<` em vez de `>=` e `<=`), então
  tarefas criadas exatamente no primeiro ou no último dia do filtro somem.
  Diagnóstico já feito na etapa de preparação; a correção é em `src/tarefas.js`.
- **Como provei que funciona:**
- **PR:**

## Tarefa 2 — Relatório de vendas

- **Situação:** não comecei
- **Qual era o problema:** o relatório filtra as vendas comparando
  `criada_em.slice(0, 10)` com o dia, ou seja, usa a data em **UTC** em vez do
  horário de Brasília, e também soma **vendas duplicadas** (o arquivo
  `data/vendas.json` traz registros repetidos por falha da sincronização).
  Cálculo feito na etapa de preparação: o código atual produz exatamente
  R$ 4.501,00 para 2026-10-01, enquanto o valor correto é R$ 3.400,50. Não
  deve-se editar `data/vendas.json` — a correção é no código.
- **Como provei que funciona:**
- **PR:**

## Tarefa 3 — Cliente vendo dado de outra empresa

- **Situação:** pronta
- **Qual era o problema:** a causa raiz era a política de RLS
  `tarefas_importacao` em `sql/schema.sql`, criada com `for all`,
  `using (true)` e `with check (true)` para a "importação inicial"
  (chamado #412). Em PostgreSQL as políticas de RLS são combinadas por **OR**:
  como essa política casava com qualquer linha, ela **anulava** a política
  `tarefas_leitura` e permitia que qualquer pessoa logada **lesse e alterasse
  tarefas de qualquer empresa**, inclusive de empresas independentes. Era
  exatamente o sintoma reportado: a cliente da Vértice Finanças (empresa 3)
  enxergando tarefas da Aurora Serviços (2), da Aurora Campo (4) e da Outra
  Empresa S.A. (5).
  Havia ainda um segundo defeito: a `tarefas_leitura` restringia à empresa
  **exata** (`empresa_id = current_setting('app.empresa_id')`), sem considerar
  a hierarquia, e não existia nenhuma política de escrita restritiva.
  **Correção:** removi a `tarefas_importacao` e criei quatro políticas
  explícitas e independentes — `tarefas_select`, `tarefas_insert`,
  `tarefas_update` (com `using` + `with check`) e `tarefas_delete` — todas
  baseadas no mesmo predicado, que resolve a árvore de empresas por um CTE
  recursivo a partir de `empresas.pai_id` e só admite a empresa logada e suas
  descendentes. Usei `nullif(current_setting('app.empresa_id', true), '')`
  para que uma sessão **sem** `app.empresa_id` não faça *match* com nenhuma
  empresa (sem isso o PGlite devolvia string vazia e o cast para `int` quebrava
  com `invalid input syntax for type integer: ""`). As tabelas e colunas
  existentes não foram alteradas, e `data/empresas.json` e
  `data/tarefas.json` ficaram intactos.
- **Como provei que funciona:**
  - **Testes automatizados** em `test/rls.test.js` (16 casos, usando o
    PGlite com os dados reais do projeto): leitura de cada uma das 5 empresas
    batendo exatamente com o conjunto esperado, sessão sem `app.empresa_id`
    sem enxergar nem poder inserir/alterar/excluir nada, INSERT bloqueado
    fora do escopo, INSERT permitido para descendente, UPDATE e DELETE
    bloqueados fora do escopo (0 linhas afetadas e linha original conferida
    intacta) e UPDATE/DELETE permitidos no escopo.
  - **Suíte completa:** `npm test` → **3 arquivos, 18 testes, 18 passando**
    (os 2 testes preexistentes continuam passando, sem regressão).
  - **Validação manual pelo comando real `npm run db`** — `empresa_id`s
    visíveis por empresa:

| Empresa logada | `empresa_id`s visíveis | Esperado | OK |
|---|---|---|---|
| 1 — Grupo Aurora | 2, 3, 4 | 1, 2, 3, 4 (sem a 5) | ✔ |
| 2 — Aurora Serviços | 2, 4 | 2, 4 | ✔ |
| 3 — Vértice Finanças | 3 | só a 3 | ✔ |
| 4 — Aurora Campo | 4 | só a 4 | ✔ |
| 5 — Outra Empresa S.A. | 5 | só a 5 | ✔ |

  - **Bloqueio de escrita comprovado pelo próprio banco:**
    `npm run db -- 3 "insert into tarefas values (9001, 2, 'invasao', ...)"`
    → erro `new row violates row-level security policy for table "tarefas"`
    (SQLSTATE 42501).
    `npm run db -- 2 "insert into tarefas values (9002, 4, 'legitima', ...)"`
    → permitido (empresa 4 é descendente da 2).
    `npm run db -- 5 "update/delete ... where id = 101"` → 0 linhas afetadas,
    e a tarefa 101 foi reconferida com o título original.
- **PR:** a ser criada — branch `tarefa-3` → `main`, **aberta e sem merge**.

## Tarefa 4 — Prazo em dias úteis

- **Situação:** não comecei
- **Qual API de feriados usei e por quê:**
- **Como provei que funciona:**
- **PR:**

## Tarefa 5 — Exportar para o Excel

- **Situação:** não comecei
- **Qual era o problema:** o `gerarCSV` usa separador `,` (o Excel em
  português usa `;`), não escapa os campos (a tarefa 112 tem aspas e
  ponto-e-vírgula no título) e não protege contra injeção de fórmula (a
  tarefa 114 começa com `=SOMA(despesas)`, que o Excel interpretaria como
  fórmula). As datas também saem em `YYYY-MM-DD` em vez de `DD/MM/AAAA`, e não
  há BOM UTF-8, o que explica os acentos estranhos. Diagnóstico feito na etapa
  de preparação.
- **Como provei que funciona:**
- **PR:**

## Encontrei também

- **A tela do frontend não aplica a hierarquia.** `src/tarefas.js` filtra com
  `t.empresa_id === empresaId` (comparação exata). Ou seja, mesmo com o banco
  corrigido, escolher "Grupo Aurora" na tela continua vazio e a empresa 2 não
  enxerga as tarefas da 4. **Deixei essa correção para a Tarefa 1**, que já
  vai mexer exatamente nessa função: assim evito conflito de merge entre as
  branches e misturo os escopos das tarefas. O ponto a replanejar é fazer o
  `listarTarefas` usar a **mesma** lógica de descendentes que está agora nas
  políticas RLS, para que a tela e o banco concordem.
- **A tabela `empresas` continua sem RLS.** É intencional: ela guarda só a
  estrutura de navegação (a árvore), não dados de tarefas, e o CTE recursivo
  das políticas precisa consultá-la. Vale registrar que qualquer papel com
  `select` nessa tabela vê a árvore completa de empresas — aceitável, já que a
  lista de empresas é pública para o seletor da tela.
- **`UPDATE`/`DELETE` fora do escopo falham de forma silenciosa.** O
  PostgreSQL filtra as linhas e retorna 0 linhas afetadas, em vez de lançar
  exceção. É o comportamento padrão do RLS e está coberto pelos testes, mas
  se a empresa quiser uma mensagem de erro explícita para o usuário, isso
  precisaria ser tratado na camada de aplicação.
- **`data/vendas.json` tem registros duplicados** (V-0992, V-0994 e V-0997
  aparecem duas vezes), o que indica falha na sincronização automática que
  gera o arquivo. Não é problema do código da Tarefa 2 (que vai deduplicar),
  mas é a origem do dado e vale um alerta para quem mantém essa sincronização.
- **A tarefa 114 (`=SOMA(despesas) conferir na auditoria`) é um caso de
  injeção de fórmula no Excel** que já existe nos dados. Além de ser escapada
  na exportação (Tarefa 5), vale a pena gerar títulos assim de forma segura
  na origem.

## O que ficou faltando / o que eu faria com mais tempo

- As Tarefas 1, 2, 4 e 5 ainda não foram implementadas — só foram
  **diagnosticadas** com profundidade na etapa de preparação (causa-raiz
  identificada em cada arquivo, cenários de teste e números esperados já
  levantados, inclusive o cálculo do R$ 3.400,50 da Tarefa 2), mas o código
  ainda não foi alterado para elas.
- Com mais tempo eu faria, nesta ordem: Tarefa 1 (com a hierarquia no
  frontend, alinhada ao banco), Tarefa 2 (fuso de Brasília + deduplicação),
  Tarefa 4 (API de feriados + coluna de SLA) e Tarefa 5 (CSV com `;`, escape
  correto, BOM UTF-8 e botão na tela).
- Eu também centralizaria a regra de descendentes em um único lugar
  compartilhado entre o SQL e o frontend, em vez de repetir a regra em dois
  lugares, reduzindo o risco de as duas camadas divergirem.
- Faltou também um teste de integração que suba o servidor real com a sessão
  HTTP e verifique o `app.empresa_id` no caminho de produção (hoje a cobertura
  é sobre o script `npm run db` e sobre o PGlite direto).
