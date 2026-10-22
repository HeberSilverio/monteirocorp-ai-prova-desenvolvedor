<div align="center">
  <img src="https://yojqjfstnvytpqqsrvap.supabase.co/storage/v1/object/public/calendar-media/746e8cdf-6612-4465-9ada-75987fb71dae/9591516d-a2c9-4380-8e1d-995451a8d1ef-1792674135810.gif" alt="Projeto rodando em localhost" width="520" />
</div>

# Status da entrega

> Preencha este arquivo na branch `main` antes de entregar.

**Nome:** Heber Silverio
**Tempo total gasto (aprox.):** 3h31m25s (registrado com Clockify)

## Ordem em que trabalhei

Comecei pela **Tarefa 3 (🟥 urgente)** por dois motivos: ela é o único item marcado como urgente no enunciado e é o problema com maior gravidade — vazamento de dados entre empresas, com impacto direto na segurança/LGPD. Além disso, é a única tarefa cuja correção fica no banco (`sql/schema.sql`), e portanto independe das demais: dá para validá-la e fechar a branch sem depender de nenhuma outra entrega.

Em seguida fiz a **Tarefa 1**, a mais visível para o cliente: a tela de tarefas ficava vazia justamente para quem usaria mais o sistema (o Grupo Aurora). Como ela mexe na mesma função que a hierarquia do banco, resolvi fazer a regra de "empresa + descendentes" **nos dois lugares** de forma consistente, para que tela e banco não discordem.

Depois dela segui por impacto: **Tarefa 2** (número financeiro errado — R$ 4.501,00 em vez de R$ 3.400,50), que já está **concluída e validada** na branch `tarefa-2`; depois a **Tarefa 4** (prazo em dias úteis — API de feriados e coluna de SLA), **também concluída e validada** na branch `tarefa-4`; e por fim **Tarefa 5** (exportação para o Excel, que depende da lista final exibida na tela para fazer sentido), **concluída e validada** na branch `tarefa-5`.  Com as cinco tarefas implementadas, o que resta para a entrega é a revisão das PRs (todas abertas e sem merge) e a consolidação das branches na `main`.

## Ferramentas utilizadas

- **Auxílio de IA:** sim, liberado pelo enunciado.
- **Ferramenta de IA:** Cline (extensão do VS Code).
- **Modelo utilizado:** `cline:cline-free/nemotron-3.5-super-vl` e o modelo
  pago `kimi-k3` (Moonshot AI).
- **Gerenciamento de tempo:** Clockify, com seis entradas registradas:
  - Prova prática - monteirocorp-ai (Preparação e diagnóstico) — 00:31:02 
  - Prova prática - monteirocorp-ai (Tarefa 3 — Segurança) — 00:53:01 
  - Prova prática - monteirocorp-ai (Tarefa 1 — Listagem) — 00:40:31 
  - Prova prática - monteirocorp-ai (Tarefa 2 — Relatório) - 00:17:21 
  - Prova prática - monteirocorp-ai (Tarefa 4 — Prazos) - 00:25:19 
  - Prova prática - monteirocorp-ai (Tarefa 5 — CSV) - 00:21:59 
  <img src="https://yojqjfstnvytpqqsrvap.supabase.co/storage/v1/object/public/calendar-media/746e8cdf-6612-4465-9ada-75987fb71dae/19f62d7c-2fb4-464e-bef2-20743937e032-1792673910915.JPG" alt="Registro no Clockify" width="300" />
- Todo o histórico das conversas com a IA está sendo salvo na pasta `sessoes/`.

## Tarefa 1 — Tela de tarefas

- **Situação:** pronta
- **Qual era o problema:** eram dois defeitos na mesma função `listarTarefas` (`src/tarefas.js`):
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
- **PR:** branch `tarefa-1` → `main`, **aberta e sem merge** —
  https://github.com/HeberSilverio/monteirocorp-ai-prova-desenvolvedor/pull/2

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
- **PR:** branch `tarefa-2` → `main`, **aberta e sem merge** —
  https://github.com/HeberSilverio/monteirocorp-ai-prova-desenvolvedor/pull/3

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
- **PR:** branch `tarefa-3` → `main`, **aberta e sem merge** —
  https://github.com/HeberSilverio/monteirocorp-ai-prova-desenvolvedor/pull/1

## Tarefa 4 — Prazo em dias úteis

- **Situação:** concluída e validada (branch `tarefa-4`)
- **Qual era o problema:** `src/prazo.js` somava **dias corridos**
  (`d.setDate(d.getDate() + dias)`), ignorando fins de semana e feriados. O
  sintoma reportado era exatamente esse: tarefa criada na **sexta** com prazo
  de **1 dia** vencendo no **sábado**. O enunciado pede prazo em **dias
  úteis**, com contagem começando no **dia seguinte** à criação e feriados
  **nacionais** obtidos de uma **API pública brasileira**.
- **Qual API de feriados usei e por quê:** a **BrasilAPI**
  (`https://brasilapi.com.br/api/feriados/v1/{ano}`) — é uma API pública
  brasileira, mantida pela comunidade, que devolve os feriados nacionais do
  ano em JSON (`date`, `name`, `type`). Escolhi essa porque já separa por
  `type`, o que permite filtrar só os **nacionais** (descartando os
  estaduais/locais) sem precisar escrever nomes ou datas à mão. As datas **não**
  foram digitadas à mão: vêm do endpoint.
- **Correção:**
  - `src/prazo.js`: mantive o nome e a assinatura exatos de
    `prazoSLA(criadaEm, dias, feriados)`. A contagem agora começa no **dia
    seguinte** à criação; cada dia **útil** (segunda a sexta, **exceto**
    feriados nacionais) consome um dia do prazo, e fins de semana e feriados
    são pulados. Usei `Date` em UTC (`T00:00:00Z`) para o cálculo não depender
    do fuso horário da máquina — o bug clássico de `toISOString()` com data
    local. A função aceita feriados tanto como `['YYYY-MM-DD']` quanto como
    objetos `{date}` (o formato que a API devolve); exportei também
    `datasFeriados()` para extrair e ordenar as datas.
  - `scripts/feriados.js` (novo) + `npm run feriados -- 2026`: consulta a
    BrasilAPI, filtra `type === 'national'`, ordena por data e grava
    `data/feriados-2026.json` (com `ano` e `fonte` para rastreabilidade).
    Falha de rede, HTTP != 200 ou ano inválido são tratados com mensagem
    clara e código de saída 1 — sem inventar dados.
  - `src/App.jsx`: nova coluna **“Prazo SLA (3 dias úteis)”**, chamando
    `prazoSLA(t.criada_em, 3, FERIADOS)`. Nada fora disso foi alterado na tela.
  - `data/feriados-2026.json` (novo, versionado) — **14 feriados nacionais
    de 2026** baixados da API.
- **Como provei que funciona:**
  - **Testes automatizados** em `test/prazo.test.js` (novo, 13 casos):
    contagem a partir do dia seguinte, fim de semana pulado, feriado no
    início e no meio do prazo, tarefa criada em fim de semana, lista de
    feriados vazia, feriados no formato de objeto da API, prazo zero, virada
    de ano (31/12 → 01/01 do ano seguinte) e independência de fuso horário.
    `npm test` → **3 arquivos, 15 testes, 15 passando** (os 2 testes
    preexistentes seguem passando, sem regressão).
  - **Geração real dos feriados:** `npm run feriados -- 2026` →
    ```
    14 feriados nacionais de 2026 salvos em data/feriados-2026.json
      2026-01-01  Confraternização mundial
      2026-02-16  Carnaval
      2026-02-17  Carnaval
      2026-04-03  Sexta-feira Santa
      2026-04-05  Páscoa
      2026-04-21  Tiradentes
      2026-05-01  Dia do trabalho
      2026-06-04  Corpus Christi
      2026-09-07  Independência do Brasil
      2026-10-12  Nossa Senhora Aparecida
      2026-11-02  Finados
      2026-11-15  Proclamação da República
      2026-11-20  Dia da consciência negra
      2026-12-25  Natal
    ```
  - **Casos conferidos à mão** (regra: começa no dia seguinte, pula fim de
    semana e feriado):
    - criada **sexta 04/09** com 1 dia útil → **terça 08/09** (07/09 é
      feriado da Independência, e sábado 05/09 não conta) — este é
      precisamente o defeito do enunciado, corrigido: antes venceria no
      sábado 05/09.
    - criada **sexta 04/09** com 3 dias úteis → **10/09** (08, 09 e 10/09).
    - criada **sexta 09/10** com 2 dias úteis → **14/10** (12/10 é feriado
    de Nossa Senhora Aparecida, 10 e 11/10 são fim de semana).
    - criada **sábado 12/09** com 1 dia útil → **segunda 14/09**.
    - criada **quinta 31/12/2026** com 1 dia útil → **sexta 01/01/2027**.
  - **Integração com a tela:** renderizei o componente `App` e conferi a
    coluna nova e os prazos calculados — tarefa de 05/09 → `2026-09-10`;
    30/09 → `2026-10-05`; 03/10 → `2026-10-07`; 10/10 → `2026-10-15`.
- **PR:** branch `tarefa-4` → `main`, **aberta e sem merge** —
  https://github.com/HeberSilverio/monteirocorp-ai-prova-desenvolvedor/pull/4

## Tarefa 5 — Exportar para o Excel

- **Situação:** concluída e validada (branch `tarefa-5`)
- **Qual era o problema:** o `gerarCSV` usava separador `,` (o Excel em
  português usa `;`), não escapava os campos (a tarefa 112 tem aspas e
  ponto-e-vírgula no título) e não protegia contra injeção de fórmula (a
  tarefa 114 começa com `=SOMA(despesas)`, que o Excel interpretaria como
  fórmula). As datas também saíam em `YYYY-MM-DD` em vez de `DD/MM/AAAA`, e não
  havia BOM UTF-8, o que explica os acentos estranhos. Diagnóstico feito na etapa
  de preparação.
- **Correção (só em `src/exportar.js` e `src/App.jsx`):**
  - `src/exportar.js`: mantive o nome e a assinatura exatos de
    `gerarCSV(tarefas)`. O gerador agora usa **ponto e vírgula** como
    delimitador e a primeira linha é exatamente `id;titulo;status;criada_em`.
    O **escape** segue o padrão RFC 4180: quando o campo contém `;`, aspas ou
    quebra de linha, ele é envolvido em aspas e as aspas internas são
    duplicadas — assim cada campo continua na **sua coluna, seja qual for o
    título**. As datas saem em `DD/MM/AAAA` e o arquivo começa com **BOM
    UTF-8** (`\uFEFF`), que é o que faz o Excel reconhecer a codificação e
    manter os acentos. Por fim, a **injeção de fórmula** foi bloqueada: um
    campo que começa com `=`, `+`, `-`, `@`, tab ou carriage return recebe um
    apóstrofo na frente, e o Excel passa a tratá-lo como texto em vez de
    executá-lo. O conteúdo original é preservado.
  - `src/App.jsx`: adicionei o botão **"Exportar CSV"**, ao lado dos filtros,
    que baixa **exatamente as tarefas que estão sendo mostradas** na tela
    (mesma lista, mesmo empresa e mesmo período selecionados). O download é
    feito com `Blob` + `URL.createObjectURL`, com `type:
    'text/csv;charset=utf-8'` e nome `tarefas.csv`; a URL do blob é revogada
    depois do clique. Nenhuma outra parte da tela foi alterada.
  - Exportei ainda `escaparCampo`, `protegerFormula`, `formatarDataBR` e
    `baixarCSV(tarefas, nomeArquivo)` — o último concentra a parte de DOM e
    devolve o conteúdo gerado, o que permitiu testá-la sem depender do
    navegador.
- **Como provei que funciona:**
  - **Testes automatizados** em `test/exportar.test.js` (novo, 21 casos):
    delimitador `;`, cabeçalho exato, data em `DD/MM/AAAA`, BOM UTF-8 (bytes
    `EF BB BF`), acentos intactos, campo com `;` e aspas mantendo as 4 colunas,
    campo com quebra de linha, injeção de fórmula (a tarefa 114 e os prefixos
    `+`, `-`, `@`, `=`), uma linha por tarefa na ordem recebida, lista vazia,
    vírgula **não** usada como delimitador, e o download (blob, nome do
    arquivo e revogação da URL).
    `npx vitest run test/exportar.test.js` → **1 arquivo, 21 testes, 21
    passando**.
    `npm test` (suíte completa) → **3 arquivos, 23 testes, 23 passando** (os 2
    testes preexistentes continuam passando, sem regressão).
  - **CSV real gerado** com as tarefas 103, 112 e 114 (as três que exercitam
    os defeitos):
    ```
    id;titulo;status;criada_em
    103;Visita técnica — Rua das Flores, 42;aberta;10/09/2026
    112;"Treinamento ""Vendas 2026""; turma 1";aberta;03/10/2026
    114;'=SOMA(despesas) conferir na auditoria;aberta;08/10/2026
    ```
    A 112 fica entre aspas, com as aspas internas duplicadas, e continua
    ocupando **uma única coluna**; a 114 ganha o apóstrofo e deixa de ser
    fórmula; os acentos de "técnica" e a travessão continuam perfeitos.
  - **Comportamento real da tela:** renderizei o componente `App` e confirmei
    que o `<button>Exportar CSV</button>` aparece junto aos filtros.
- **PR:** branch `tarefa-5` → `main`, **aberta e sem merge** —
  https://github.com/HeberSilverio/monteirocorp-ai-prova-desenvolvedor/pull/5

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


