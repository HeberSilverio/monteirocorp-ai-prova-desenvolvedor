# Status da entrega

> Preencha este arquivo na branch `main` antes de entregar.

**Nome:** Heber Silverio
**Tempo total gasto (aprox.):** 2h15m36s (registrado com Clockify)

## Ordem em que trabalhei

Comecei pela **Tarefa 3 (🟥 urgente)** por dois motivos: ela é o único item
marcado como urgente no enunciado e é o problema com maior gravidade — vazamento
de dados entre empresas, com impacto direto na segurança/LGPD. Além disso, é a
única tarefa cuja correção fica no banco (`sql/schema.sql`), e portanto
independe das demais: dá para validá-la e fechar a branch sem depender de
nenhuma outra entrega.

Em seguida fiz a **Tarefa 1**, a mais visível para o cliente: a tela de tarefas
ficava vazia justamente para quem usaria mais o sistema (o Grupo Aurora). Como
ela mexe na mesma função que a hierarquia do banco, resolvi fazer a regra de
"empresa + descendentes" **nos dois lugares** de forma consistente, para que
tela e banco não discordem.

Depois dela segui por impacto: **Tarefa 2** (número financeiro errado — R$ 4.501,00
em vez de R$ 3.400,50), que já está **concluída e validada** na branch
`tarefa-2`; depois seguem **Tarefa 4** (prazo em dias úteis, que depende de
escolher e consultar a API de feriados) e por fim **Tarefa 5** (exportação para
o Excel, que depende da lista final exibida na tela para fazer sentido).

## Ferramentas utilizadas

- **Auxílio de IA:** sim, liberado pelo enunciado.
- **Ferramenta de IA:** Cline (extensão do VS Code).
- **Modelo utilizado:** `cline:cline-free/nemotron-3.5-super-vl` e o modelo
  pago `kimi-k3` (Moonshot AI).
- **Gerenciamento de tempo:** Clockify, com quatro entradas registradas:
  - Prova prática - monteirocorp-ai (Preparação e diagnóstico) — 00:31:02
  - Prova prática - monteirocorp-ai (Tarefa 3 — Segurança) — 00:53:01
  - Prova prática - monteirocorp-ai (Tarefa 1 — Listagem) — 00:40:31
  - Prova prática - monteirocorp-ai (Tarefa 2 — Relatório) - 00:17:21
- Todo o histórico das conversas com a IA está sendo salvo na pasta `sessoes/`.

## Tarefa 1 — Tela de tarefas

- **Situação:** pronta
- **Qual era o problema:** eram dois defeitos na mesma função `listarTarefas`
  (`src/tarefas.js`):
  1. **Tela vazia no Grupo Aurora.** O filtro era
     `.filter((t) => t.empresa_id === empresaId)` — igualdade **exata**. Como
     a empresa 1 (Grupo Aurora) é apenas a raiz da árvore e **não tem tarefa
     própria** em `data/tarefas.json`, o resultado era sempre `[]` e a tela
     mostrava "Nenhuma tarefa no período". A regra do README (seção 2) é
     "a empresa **e todas as empresas abaixo dela**", que nunca tinha sido
     implementada no frontend.
  2. **Tarefa do dia da ponta sumia.** O filtro de período usava
     `t.criada_em > de && t.criada_em < ate`, com operadores **estritos**:
     uma tarefa criada exatamente em `de` ou em `ate` era descartada. O
     enunciado pede para incluir **os dois dias das pontas**.
  **Correção:** mantive o nome e a assinatura exatos da função
  (`listarTarefas({tarefas, empresas, empresaId, de, ate})`) e criei dois
  helpers: `idsVisiveis()` percorre a árvore por `pai_id` (DFS com pilha,
  usando o conjunto de visitados como guarda, para uma hierarquia cíclica não
  gerar laço infinito) e devolve o conjunto `{empresa} ∪ descendentes`; e
  `soData()` normaliza as datas para `YYYY-MM-DD` (corta a hora, se houver).
  A comparação de período passou a descartar só o que está **fora** dos
  limites (`< de` ou `> ate`), tornando as pontas inclusivas. A ordenação por
  `criada_em` e o comportamento da tela foram preservados, e o `src/App.jsx`
  não precisou ser alterado. Nenhuma tabela, coluna ou dado foi tocado.
- **Como provei que funciona:**
  - **Testes automatizados** em `test/tarefas.test.js`: o teste que já
    existia foi **mantido intacto** e segue passando, e acrescentei 18 casos
    novos. `npm test` → **2 arquivos, 20 testes, 20 passando** (antes eram
    1 teste).
  - **Hierarquia**, verificada com os dados reais do projeto:

| Empresa escolhida | Empresas visíveis | Ids das tarefas | OK |
|---|---|---|---|
| 1 — Grupo Aurora | 1, 2, 3, 4 (nunca a 5) | 101,102,103,104,105,106,108,109,110,112,113,114,115 (13) | ✔ |
| 2 — Aurora Serviços | 2 e 4 | 101,102,103,104,108,109,112,113,115 | ✔ |
| 3 — Vértice Finanças | só a 3 | 105,106,110,114 | ✔ |
| 4 — Aurora Campo | só a 4 | 103,104,109,113 | ✔ |
| 5 — Outra Empresa S.A. | só a 5 | 107,111 | ✔ |

  - **Datas inclusivas:** a tarefa **101** (2026-09-01) aparece quando o
    período começa em 2026-09-01; a tarefa **108** (2026-09-30) aparece
    quando o período termina em 2026-09-30; a 101 e a 108 ficam de fora
    quando o período é 2026-09-05..2026-09-20.
  - **Ordenação:** conferida par a par — o Grupo Aurora no período padrão
    devolve 13 tarefas em ordem crescente de `criada_em`.
  - **Comportamento real da tela:** `npm run dev` sobe sem erro (Vite pronto,
    HTTP 200) e, com o Grupo Aurora selecionado e o período padrão
    (01/09 a 31/10), a listagem passa de **0 linhas para 13**, sem nenhuma
    tarefa da Outra Empresa S.A. (ids 107 e 111).
- **PR:** a ser criada — branch `tarefa-1` → `main`, **aberta e sem merge**.

## Tarefa 2 — Relatório de vendas

- **Situação:** concluída e validada pelo relatório (branch `tarefa-2`)
- **Qual era o problema:** eram **três defeitos** no mesmo cálculo, e não só um:
  1. **Fuso horário.** O filtro comparava `criada_em.slice(0, 10)` com o dia, ou
     seja, usava a data em **UTC** em vez do horário de Brasília (UTC-3). Uma
     venda criada perto da meia-noite caía no dia errado: `V-0995`
     (2026-10-02T01:30Z) é **01/10 22:30 em Brasília** e estava fora do dia,
     enquanto `V-0990` (2026-10-01T02:00Z) é **30/09 23:00 em Brasília** e
     estava dentro.
  2. **Duplicatas.** A sincronização automática reenvia vendas: `V-0992`,
     `V-0994` e `V-0997` aparecem **duas vezes** em `data/vendas.json`, e cada
     cópia era somada.
  3. **Ticket médio divergente.** O divisor contava vendas **canceladas** e
     **duplicadas**, enquanto o total vinha de um conjunto diferente — por isso
     os dois números não fechavam entre si.

  Cálculo feito na etapa de preparação: o código antigo produzia exatamente
  R$ 4.501,00 para 2026-10-01, enquanto o valor correto é R$ 3.400,50.
  **Correção (só em `src/relatorio.js`):** criei o helper
  `vendasValidasDoDia(vendas, dia)`, que (a) mantém só `status === 'paga'`,
  (b) converte o timestamp para a data no horário de Brasília (deslocamento
  fixo de -3h) antes de comparar com o dia, e (c) elimina duplicatas pelo
  `id` da venda (a primeira ocorrência vence). `totalDoDia` e `ticketMedio`
  passaram a consumir **exatamente o mesmo conjunto** deduplicado — o ticket
  médio agora é o total dividido pelo número de vendas válidas, e não por um
  total de vendas diferente. Os nomes e as assinaturas de `totalDoDia(vendas,
  dia)`, `ticketMedio(vendas, dia)` e `formatarBRL(valor)` foram preservados,
  assim como o uso de `npm run relatorio -- 2026-10-01`.
  **`data/vendas.json` não foi alterado** (é substituído pela sincronização).
- **Como provei que funciona:**
  - **Testes automatizados** em `test/relatorio.test.js`: o teste que já
    existia foi **mantido intacto** e segue passando, e acrescentei 13 casos
    novos — fuso de Brasília nos dois sentidos (venda que "entra" no dia em
    Brasília e venda que "sai"), duplicatas da sincronização (inclusive
    vendas distintas com o mesmo valor, que **não** podem ser fundidas),
    canceladas e pendentes, ticket médio com o mesmo conjunto do total,
    formatação em BRL e os números dos dados reais.
    `npm test` → **2 arquivos, 15 testes, 15 passando**.
  - **Execução do relatório real** — `npm run relatorio -- 2026-10-01`:
    ```
    Relatório de vendas — 2026-10-01
    Total vendido: R$ 3.400,50
    Ticket médio:  R$ 680,10
    ```
    Total = **R$ 3.400,50**, exatamente o valor conferido pelo financeiro
    (ticket médio = 3.400,50 ÷ 5 vendas válidas = R$ 680,10).
  - **Conferência venda a venda** (vendas pagas, deduplicadas, em Brasília):

    | id | valor | criada_em (UTC) | em Brasília (UTC-3) | Entra em 01/10 |
    |---|---|---|---|---|
    | V-0991 | 1.000,00 | 2026-10-01T12:00Z | 01/10 09:00 | ✔ |
    | V-0992 | 250,50 | 2026-10-01T15:30Z | 01/10 12:30 | ✔ |
    | V-0994 | 1.200,00 | 2026-10-01T20:00Z | 01/10 17:00 | ✔ |
    | V-0995 | 800,00 | 2026-10-02T01:30Z | 01/10 22:30 | ✔ |
    | V-0996 | 150,00 | 2026-10-02T02:45Z | 01/10 23:45 | ✔ |
    | | **3.400,50** | | | 5 vendas |

    Fora do dia: `V-0988` e `V-0989` (30/09), `V-0990` (30/09 em Brasília),
    `V-0997` e `V-0999` (02/10 em Brasília); canceladas fora da conta:
    `V-0993` (400,00) e `V-0998` (75,90).
- **PR:** a ser criada manualmente — branch `tarefa-2` → `main`, **aberta e sem
  merge**. O link ainda não foi preenchido.

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

- **A hierarquia do banco e a da tela estavam em desacordo.** O RLS (Tarefa 3)
  e o `listarTarefas` (Tarefa 1) implementam a mesma regra de "empresa +
  descendentes", mas em lugares diferentes. Resolvi os dois com a mesma
  semântica e validei que produzem o **mesmo conjunto** de empresas visíveis
  nos dados atuais (1→{1,2,3,4}, 2→{2,4}, 3→{3}, 4→{4}, 5→{5}). Ainda assim
  são duas implementações da mesma regra: uma mudança futura na árvore
  (`data/empresas.json`) precisa ser refletida nas duas. **Um teste de
  paridade** entre o RLS e o frontend seria o próximo passo natural.
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
  gera o arquivo. Isso **não** é problema do código da Tarefa 2 (que agora
  deduplica por `id`), mas é a origem do dado e vale um alerta para quem
  mantém essa sincronização.
- **A tarefa 114 (`=SOMA(despesas) conferir na auditoria`) é um caso de
  injeção de fórmula no Excel** que já existe nos dados. Além de ser escapada
  na exportação (Tarefa 5), vale a pena gerar títulos assim de forma segura
  na origem.
- **A ordenação por `criada_em` é textual e estável apenas dentro do mesmo
  dia.** Duas tarefas criadas no mesmo dia mantêm a ordem do arquivo (o
  `Array.prototype.sort` é estável no V8). Se a tela precisar de uma ordem
  dentro do dia (por exemplo, por hora de criação), faltaria o campo de hora
  em `criada_em` — hoje ele só tem data.

## O que ficou faltando / o que eu faria com mais tempo

- A **Tarefa 4** e a **Tarefa 5** ainda não foram implementadas — só foram
  **diagnosticadas** com profundidade na etapa de preparação (causa-raiz
  identificada em cada arquivo, cenários de teste e números esperados já
  levantados), mas o código ainda não foi alterado para elas.
- Com mais tempo eu faria, nesta ordem: Tarefa 4 (API de feriados + coluna de
  SLA) e Tarefa 5 (CSV com `;`, escape correto, BOM UTF-8 e botão na tela).
- Eu também centralizaria a regra de descendentes em um único lugar
  compartilhado entre o SQL e o frontend, em vez de repetir a regra em dois
  lugares, reduzindo o risco de as duas camadas divergirem.
- Faltou também um teste de integração que suba o servidor real com a sessão
  HTTP e verifique o `app.empresa_id` no caminho de produção (hoje a cobertura
  é sobre o script `npm run db` e sobre o PGlite direto).
- Na Tarefa 1 eu validei a listagem chamando a função com os mesmos
  parâmetros que o `App.jsx` usa e subi o Vite para confirmar que o app
  renderiza, mas não fiz um teste de interface que simulasse a troca do
  seletor de empresa — a cobertura é da função, não do componente.
