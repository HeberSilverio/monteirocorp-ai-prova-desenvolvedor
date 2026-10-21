Estou realizando uma prova técnica para uma vaga de desenvolvedor. O projeto já está clonado localmente, aberto no VS Code e executando corretamente.

**Ambiente confirmado:**
- Windows com VS Code e terminal Git Bash.
- Node.js v24.18.0.
- npm 11.16.0.
- Dependências instaladas com `npm install`.
- Aplicação executando com `npm run dev` em `http://localhost:5173/`.
- Testes iniciais executados com `npm test`: 2 arquivos e 2 testes passaram.
- Estou usando o Cline, atualmente no modo Plan.

**Objetivo desta etapa: investigar o projeto e elaborar o plano de execução das cinco tarefas da prova.**

Leia integralmente o `README.md` e examine os arquivos relevantes do projeto, incluindo `package.json`, `src/`, `sql/`, `test/`, `scripts/`, `data/`, `STATUS.md` e `sessoes/`, conforme existirem.

Quero que você:

1. Resuma os requisitos e as regras de entrega do README, sem omitir detalhes obrigatórios.
2. Identifique a estrutura do projeto, as funções principais e os arquivos envolvidos em cada uma das cinco tarefas.
3. Investigue as possíveis causas de cada problema, relacionando-as ao código existente.
4. Analise os testes atuais e identifique quais cenários adicionais precisam ser testados para comprovar cada correção.
5. Dê atenção especial à Tarefa 3, identificando os riscos de isolamento de dados entre empresas e as regras de acesso relevantes no banco.
6. Identifique as restrições que devem ser preservadas, incluindo assinaturas de funções, estruturas de dados, tabelas, colunas e arquivos de referência que não podem ser alterados.
7. Proponha uma ordem de implementação e uma estratégia de branches, commits e Pull Requests que cumpra exatamente as instruções do README.
8. Explique como preencher o `STATUS.md` e registrar o histórico das sessões de IA na pasta `sessoes/`.
9. Informe os comandos necessários para executar os testes e validar cada tarefa no ambiente Windows/Git Bash.

**Restrições desta etapa:**
- Não modifique, crie, exclua ou formate arquivos.
- Não execute migrações nem altere o banco de dados.
- Não instale, atualize ou remova dependências.
- Não execute `npm audit fix` nem comandos com `--force`.
- Não faça commits, pushes, merges ou crie Pull Requests.
- Não presuma que uma causa está confirmada sem examinar o código e os testes.
- Diferencie claramente os fatos verificados das hipóteses.

Ao terminar, apresente um plano de execução priorizado, indicando os arquivos envolvidos, os riscos, os testes necessários e os critérios de conclusão de cada tarefa.

Aguarde minha aprovação antes de iniciar qualquer implementação.

---------------------------------------------------------------------------------------
Tenho agora a visão completa do projeto. A seguir apresento minha análise e o plano de execução, como solicitado (modo Plan — nenhum arquivo será modificado).

1. Resumo dos requisitos e regras de entrega (README.md)
Contexto de negócio
As empresas estão organizadas em árvore:


Grupo Aurora (1)
├── Aurora Serviços (2)
│   └── Aurora Campo (4)
└── Vértice Finanças (3)
Outra Empresa S.A. (5)  ← independente, fora do grupo
Regra de ouro: quem escolhe uma empresa vê os dados dela e de todas as empresas abaixo. Quem escolhe o Grupo Aurora vê tudo do grupo. Ninguém do grupo vê a Outra Empresa S.A., e ela não vê ninguém do grupo.

As cinco tarefas
Tarefa	Classificação	Problema	Arquivo principal
Tarefa 3	🟥 URGENTE	Cliente da Vértice Finanças vê tarefas da Aurora Serviços e da Outra Empresa S.A.	sql/schema.sql (RLS)
Tarefa 1	🟨	Tela de tarefas vazia ao escolher Grupo Aurora; tarefa criada no último dia do filtro some	src/App.jsx, src/tarefas.js
Tarefa 2	🟦	Relatório de 01/10/2026 mostra R$ 4.501,00; correto é R$ 3.400,50	src/relatorio.js, scripts/relatorio.js, data/vendas.json
Tarefa 4	🟩	Prazo conta dias corridos, deveria ser dias úteis (sex + 1 dia útil vence no sábado)	src/prazo.js, App.jsx (nova coluna), novo comando npm run feriados
Tarefa 5	🟪	CSV abre tudo numa coluna só, acentos estranhos, quebra com títulos especiais	src/exportar.js, App.jsx (botão Exportar CSV)
Regras de entrega obrigatórias
Uma branch por tarefa, nomes exatos: tarefa-1, tarefa-2, tarefa-3, tarefa-4, tarefa-5, todas saindo da main.
Uma Pull Request por tarefa, de cada branch para a main do seu repositório. Deixar as PRs abertas, sem fazer merge. Descrição da PR deve explicar problema, correção e como provou que funciona.
Na main, preencher STATUS.md e fazer commit.
Na main, salvar na pasta sessoes/ o histórico das conversas com IA (.md, via /export no Claude Code ou colagem manual).
Enviar link do repositório pelo WhatsApp.
O que avaliam
Correções funcionam de verdade, inclusive em casos fora dos testes existentes.
Provar o que se diz (testes, números, comparações).
Organização: branches, PRs e status claros.
Investigação: achar a causa, não só o sintoma.
Olhar além do pedido: relatar outros problemas no STATUS.md.
Honestidade sobre o que não deu para terminar.
Restrições de código explicitadas no README
Tarefa 1: manter nome e parâmetros de listarTarefas. Filtro de período inclusive nos dois dias (de até ate).
Tarefa 2: não editar data/vendas.json (é substituído pela sincronização automática). Corrigir o código. Manter nomes e parâmetros das funções de src/relatorio.js.
Tarefa 3: manter tabelas e colunas como estão.
Tarefa 4: manter nome e parâmetros de prazoSLA. Feriados vêm da internet (API pública brasileira), não digitar à mão. Criar npm run feriados -- 2026 que salva data/feriados-2026.json e fazer commit desse arquivo. SLA de 3 dias úteis numa coluna nova da tela.
Tarefa 5: manter nome e parâmetros de gerarCSV. Separador ;, header id;titulo;status;criada_em, datas DD/MM/AAAA, abrir no Excel com acentos certos e cada campo na sua coluna "seja qual for o título". Botão "Exportar CSV" na tela.
2. Estrutura do projeto e arquivos envolvidos por tarefa
Estrutura geral (fora node_modules/ e .git/)

data/          empresas.json, tarefas.json, vendas.json  (dados de referência)
sql/           schema.sql                                (DDL + políticas RLS)
scripts/       db.js (consulta SQL como empresa), relatorio.js (CLI do relatório)
src/           App.jsx (tela React), tarefas.js, relatorio.js, prazo.js, exportar.js, main.jsx
test/          tarefas.test.js, relatorio.test.js        (vitest)
sessoes/       .gitkeep                                  (histórico de sessões IA)
STATUS.md      (template a preencher na main)
package.json   (scripts: dev, test, relatorio, db)
Arquivos por tarefa
Tarefa 1: src/tarefas.js (lógica de filtro), src/App.jsx (tela), data/tarefas.json, data/empresas.json (leitura), test/tarefas.test.js.
Tarefa 2: src/relatorio.js (totalDoDia, ticketMedio), scripts/relatorio.js, data/vendas.json (somente leitura), test/relatorio.test.js.
Tarefa 3: sql/schema.sql (políticas RLS), scripts/db.js (validação), src/tarefas.js (equivalente no frontend — embora o problema reportado seja do banco, o frontend também filtra por empresa_id === exato e precisa da mesma hierarquia para consistência com a tela).
Tarefa 4: src/prazo.js (prazoSLA), novo script scripts/feriados.js (a criar), novo data/feriados-2026.json (a criar via comando), src/App.jsx (coluna de prazo), package.json (a adicionar script feriados).
Tarefa 5: src/exportar.js (gerarCSV), src/App.jsx (botão de exportação), data/tarefas.json (dados de exemplo com títulos perigosos: aspas, vírgulas, =SOMA(...)).
3. Investigação das causas de cada problema (fatos verificados vs hipóteses)
Tarefa 3 — Isolamento de dados (CAUSA PRINCIPAL IDENTIFICADA)
Fatos verificados no sql/schema.sql:

tarefas tem RLS habilitado (alter table tarefas enable row level security).
Política tarefas_leitura (SELECT): using (empresa_id = current_setting('app.empresa_id', true)::int) — restringe apenas à empresa exata, sem considerar a hierarquia (empresas filhas). Mesmo assim, sozinha não explicaria a Vértice ver tarefas da Aurora e da Outra Empresa.
Política tarefas_importacao: for all, using (true), with check (true) — comentada como "liberado para a importação inicial (chamado #412)". Esta política permite qualquer operação (select, insert, update, delete) sobre qualquer linha de qualquer empresa, para qualquer usuário. No PostgreSQL, políticas RLS se aplicam por OR: se qualquer política corresponder, a linha é visível/permitida. Portanto, esta política aberta anula completamente a restrição da tarefas_leitura.
Hipótese confirmada por eliminação: A cliente da Vértice Finanças (empresa 3) vê tarefas da Aurora Serviços (2), Aurora Campo (4) e Outra Empresa S.A. (5) porque a política tarefas_importacao com true permite a leitura de todas as linhas, independentemente de app.empresa_id. É a causa provável do vazamento.

Problema secundário no frontend: src/tarefas.js filtra t.empresa_id === empresaId (exato, sem hierarquia). Escolhendo Grupo Aurora (1), não haveria tarefas com empresa_id = 1 (todas são de filiais 2, 3, 4), então a tela fica vazia — isso se sobrepõe à Tarefa 1.

Riscos de isolamento (Tarefa 3):

tarefas_importacao abre escrita (with check (true)): qualquer empresa logada pode inserir/alterar/excluir tarefas de qualquer empresa, incluindo do grupo concorrente ou da Outra Empresa S.A.
Não há restrição de hierarquia: mesmo corrigindo a política aberta, a leitura continua restrita à empresa exata (não enxerga filiais).
Não há política explícita de INSERT/UPDATE/DELETE além da importação aberta; após removê-la, é preciso criar políticas de escrita que respeitem a regra do negócio.
Tarefa 1 — Tela vazia e filtro de período
Fatos verificados em src/tarefas.js:

Linha 14: .filter((t) => t.empresa_id === empresaId) — filtro exato. Grupo Aurora (1) não tem tarefas próprias → tela vazia. Causa confirmada.
Linha 15: .filter((t) => t.criada_em > de && t.criada_em < ate) — comparação estrita. Uma tarefa criada exatamente em de ou ate é excluída. Exemplo: tarefa 109 criada em 2026-10-01 some se ate = '2026-10-01'. Causa confirmada ("tarefa criada no último dia do filtro também some").
Tarefa 2 — Relatório errado (causa confirmada por cálculo)
Fatos verificados em data/vendas.json e src/relatorio.js:

totalDoDia compara v.criada_em.slice(0, 10) === dia diretamente no timestamp UTC das vendas.
Cálculo com o código atual para 2026-10-01:
V-0990 (600,00, 02:00Z), V-0991 (1.000,00, 12:00Z), V-0992 (250,50 ×2 duplicados, 15:30Z), V-0994 (1.200,00 ×2 duplicados, 20:00Z) → 600 + 1.000 + 501 + 2.400 = 4.501,00. Confere exatamente com o valor reportado como errado.
Cálculo correto em horário de Brasília (UTC-3), pagas, sem duplicatas:
V-0990: 02:00Z = 23:00 de 30/09 em Brasília → não conta.
V-0991: 12:00Z = 09:00 de 01/10 → conta (1.000,00).
V-0992: 15:30Z = 12:30 de 01/10 → conta uma vez (250,50).
V-0994: 20:00Z = 17:00 de 01/10 → conta uma vez (1.200,00).
V-0995: 02/10 01:30Z = 01/10 22:30 em Brasília → conta (800,00).
V-0996: 02/10 02:45Z = 01/10 23:45 em Brasília → conta (150,00).
Total: 1.000 + 250,50 + 1.200 + 800 + 150 = 3.400,50. Confere exatamente com o valor esperado.
Causas confirmadas (duas):

Fuso horário: slice(0,10) usa a data UTC, não a data de Brasília. Vendas após 21:00Z "migram" para o dia seguinte; vendas antes de 03:00Z "migram" para o dia anterior.
Duplicatas: data/vendas.json contém registros repetidos (V-0992, V-0994, V-0997 aparecem duas vezes) — fruto da sincronização automática. O código soma duplicados. Como o arquivo não pode ser editado, o código deve deduplicar (por id).
ticketMedio também depende do mesmo conjunto filtrado e deve ser ajustado para consistência.

Tarefa 4 — Prazo em dias úteis
Fato verificado em src/prazo.js:

prazoSLA apenas faz d.setDate(d.getDate() + dias): conta dias corridos, a partir do próprio dia de criação, sem considerar fins de semana nem feriados. Causa confirmada. Tarefa de sexta + 1 dia útil vence no sábado (deveria ser segunda).
Requisitos a implementar:

Começar a contar no dia seguinte à criação.
Dia útil = segunda a sexta, exceto feriados nacionais.
Feriados via API pública brasileira (não digitar à mão). Candidata: BrasilAPI (https://brasilapi.com.br/api/feriados/v1/2026) — a confirmar se funciona sem chave no ambiente. Marcar como hipótese a validar na implementação.
Criar npm run feriados -- 2026 → salva data/feriados-2026.json → commit desse arquivo.
Tela: nova coluna com prazo, SLA de 3 dias úteis.
Manter assinatura prazoSLA(criadaEm, dias, feriados).
Tarefa 5 — Exportar CSV
Fatos verificados em src/exportar.js:

Separador , (deve ser ;).
Header id,titulo,status,criada_em (deve ser id;titulo;status;criada_em).
Data criada_em crua YYYY-MM-DD (deve ser DD/MM/AAAA).
Não escapa campos: título 112 tem aspas (Treinamento "Vendas 2026"; turma 1), título 114 começa com =SOMA(despesas) (injeção de fórmula no Excel) — ambos quebram "cada campo na sua coluna" e podem ser interpretados como fórmula.
Sem BOM/UTF-8 correto → acentos estranhos no Excel.
src/App.jsx não tem botão de exportação.
4. Testes atuais e cenários adicionais necessários
Testes existentes
test/tarefas.test.js: 1 teste — Vértice (3) em setembro retorna [105, 106]. Com correção de hierarquia, Vértice não tem filhas, então continua passando.
test/relatorio.test.js: 1 teste — totalDoDia soma só pagas com dados sintéticos em UTC no mesmo dia. Continua passando se a lógica de filtro por pagamento for mantida.
Cenários adicionais a testar (não existem ainda)
Tarefa 1 (listarTarefas):

Grupo Aurora (1) deve ver tarefas de 1, 2, 3 e 4 (todas do grupo), nunca a 5.
Aurora Serviços (2) vê 2 e 4; Aurora Campo (4) vê só 4; Vértice (3) vê só 3; Outra Empresa (5) vê só 5.
Período inclusivo: tarefa criada exatamente em de e exatamente em ate deve aparecer.
Ordenação por criada_em.
Tarefa 2 (totalDoDia / ticketMedio):

totalDoDia(vendas, '2026-10-01') com o arquivo real deve retornar 3400.50.
Venda às 02:00Z de 01/10 (23:00 de 30/09 em BR) não conta para 01/10.
Venda às 01:30Z de 02/10 (22:30 de 01/10 em BR) conta para 01/10.
Duplicatas por id contam uma vez só.
Vendas canceladas não somam.
ticketMedio consistente com o conjunto deduplicado e convertido.
Tarefa 3 (validação via npm run db):

Empresa 3 (Vértice) não vê tarefas de 2, 4 nem 5.
Empresa 1 (Grupo Aurora) vê tarefas de 1, 2, 3, 4, mas não 5.
Empresa 5 vê só 5.
INSERT de tarefa com empresa_id de outra empresa deve ser bloqueado.
UPDATE/DELETE de tarefa de outra empresa bloqueados.
Sem app.empresa_id definido, nenhuma linha é visível.
Tarefa 4 (prazoSLA):

Sexta + 1 dia útil → segunda seguinte (não sábado).
Feriado nacional não conta como dia útil.
Contagem começa no dia seguinte à criação.
Com feriados reais de data/feriados-2026.json.
Tarefa 5 (gerarCSV):

Separador ;.
Header exato id;titulo;status;criada_em.
Datas no formato DD/MM/AAAA.
Título com aspas e ponto-e-vírgula (id 112) escapado corretamente.
Título =SOMA(...) (id 114) tratado como texto, não como fórmula Excel.
Acentos preservados (UTF-8 com BOM).
5. Atenção especial à Tarefa 3 — isolamento de dados e regras de acesso
A Tarefa 3 é a mais crítica porque envolve vazamento de dados entre empresas (LGPD/segurança).

Regras de acesso no banco (sql/schema.sql):

Cada sessão define app.empresa_id antes de consultar (feito em scripts/db.js linha 32).
Usuário app_user tem select, insert, update, delete em todas as tabelas.
RLS está ligado apenas em tarefas (não em empresas, mas empresas é só referência da árvore).
O que deve ser feito no SQL (sem alterar tabelas/colunas):

Remover a política tarefas_importacao (for all ... true) — brecha de leitura e escrita irrestrita.
Substituir tarefas_leitura por uma política que inclua a hierarquia:

empresa_id = current_setting('app.empresa_id', true)::int
OR empresa_id é descendente de current_setting(...)
Isso exige uma função ou CTE recursiva sobre empresas(pai_id).
Criar políticas de INSERT, UPDATE, DELETE com a mesma regra de hierarquia (só pode criar/alterar tarefas da própria empresa ou de empresas abaixo).
No frontend (src/tarefas.js), aplicar a mesma lógica de hierarquia para que o seletor Grupo Aurora mostre tarefas de toda a árvore.
Risco técnico: políticas RLS com subconsulta/CTE recursiva no PGlite (Postgres em memória usado pelo scripts/db.js) precisam ser validadas com npm run db. Se o PGlite não suportar algo, alternativa é unir IDs válidos na aplicação — mas a correção deve estar no banco, conforme a tarefa pede ("O acesso ao banco está em sql/schema.sql").

6. Restrições que devem ser preservadas (não alterar)
Assinaturas de funções: listarTarefas({tarefas, empresas, empresaId, de, ate}), totalDoDia(vendas, dia), ticketMedio(vendas, dia), formatarBRL(valor), prazoSLA(criadaEm, dias, feriados), gerarCSV(tarefas).
Tabelas e colunas SQL: empresas(id, nome, pai_id), tarefas(id, empresa_id, titulo, status, criada_em). Podem ser criadas funções/políticas, mas não mudar DDL existente.
Arquivos de referência (não editar): data/vendas.json (expressamente proibido pelo README). Recomendo também não editar data/tarefas.json nem data/empresas.json.
Nomes dos scripts existentes: relatorio e db continuam funcionando.
Novo comando obrigatório: npm run feriados -- 2026 (requer adicionar script ao package.json e criar scripts/feriados.js).
Arquivo data/feriados-2026.json: gerado pelo comando e commitado.
7. Ordem de implementação, branches, commits e Pull Requests
Ordem sugerida (priorizando urgência e dependências)
Tarefa 3 — URGENTE (segurança, vazamento de dados).
Tarefa 1 — tela inutilizável para o Grupo Aurora.
Tarefa 2 — dados financeiros incorretos.
Tarefa 4 — prazo/SLA (depende da API de feriados e do arquivo feriados-2026.json).
Tarefa 5 — exportação CSV.
Estratégia de git (exatamente como o README pede)
Tudo a partir do estado atual da main (sem fazer merge das PRs):


git checkout -b tarefa-3 main   # implementa Tarefa 3
git commit ...
git push origin tarefa-3
# Abrir PR tarefa-3 -> main (aberta, sem merge)

git checkout -b tarefa-1 main   # implementa Tarefa 1
...
# Abrir PR tarefa-1 -> main

... repetir para tarefa-2, tarefa-4, tarefa-5
Cada PR deve conter, na descrição: problema, correção e como provou que funcionar (testes, comandos, números).

Na branch main (apenas no final, sem fazer merge das PRs):
Preencher STATUS.md e commitar.
Salvar histórico das sessões de IA em sessoes/ (arquivos .md) e commitar.
Não fazer merge das branches de tarefa na main (PRs devem ficar abertas).
8. Como preencher STATUS.md e registrar sessões em sessoes/
STATUS.md (na main)
Preencher todos os campos do template existente:

Nome e tempo total gasto.
Ordem de trabalho e por quê.
Para cada tarefa: Situação (pronta/parcial/não comecei), Qual era o problema, Como provei que funciona (números, testes, prints), Link da PR.
Seção "Encontrei também": outros problemas encontrados que não foram pedidos.
Seção "O que ficou faltando / o que eu faria com mais tempo": honestidade sobre itens incompletos.
sessoes/
No Claude Code, usar o comando /export em cada sessão de trabalho com IA e salvar o arquivo .md resultante em sessoes/.
Se usar outra ferramenta, colar o histórico em .md na mesma pasta.
Pasta já existe com .gitkeep; adicionar os arquivos de histórico e commitar na main.
9. Comandos para executar testes e validar cada tarefa (Windows / Git Bash)
Comando	Propósito
npm test	Roda todos os testes vitest (atualmente 2 arquivos, 2 testes). Rodar após cada tarefa para garantir regressão.
npm run dev	Inicia a tela em http://localhost:5173/. Validar visualmente Tarefas 1, 4 e 5.
npm run relatorio -- 2026-10-01	Deve imprimir Total vendido: R$ 3.400,50 (Tarefa 2).
npm run db -- 3 "select id, empresa_id, titulo from tarefas"	Consulta como Vértice Finanças. Deve retornar só tarefas da empresa 3 (Tarefa 3). Repetir para empresas 1, 2, 4, 5.
npm run feriados -- 2026	Baixa feriados nacionais de 2026 e salva data/feriados-2026.json (Tarefa 4).
Validações específicas por tarefa via npm run db:

npm run db -- 1 "select id, empresa_id from tarefas" → deve conter empresas 1, 2, 3, 4 (não 5).
npm run db -- 5 "select id, empresa_id from tarefas" → só empresa 5.
Teste de escrita (hipotético, validar bloqueio): npm run db -- 3 "insert into tarefas values (999, 2, 'invasao', 'aberta', '2026-10-01')" → deve falhar com erro de RLS.
10. Riscos identificados
Tarefa	Risco	Mitigação
3	PGlite pode não suportar CTE recursiva/funções em políticas RLS	Validar com npm run db; ter alternativa pronta
4	Dependência de internet para a API de feriados (pode falhar offline)	Testar a API candidata (BrasilAPI); ter plano de fallback com arquivo salvo
4	Fuso horário na leitura de criada_em (YYYY-MM-DD)	Usar toISOString().slice(0,10) com cuidado; testar em datas de limite
5	Injeção de fórmula CSV (=SOMA(...)) e títulos com aspas/pontos-e-vírgula	Escapar campos envolvendo em aspas duplas e dobrando aspas internas
5	Acentos no Excel	Gerar arquivo com BOM UTF-8 (\uFEFF) e text/csv;charset=utf-8
4/5	Adicionar script ao package.json	Edição necessária e permitida (README exige o comando npm run feriados)
Critérios de conclusão de cada tarefa
Tarefa 3: npm run db mostra que cada empresa vê só a si e suas filhas; escritas de outras empresas são bloqueadas. Sem vazamento para a Outra Empresa S.A.
Tarefa 1: Grupo Aurora mostra tarefas do grupo; filtro inclui ambos os dias da ponta; testes novos passam.
Tarefa 2: npm run relatorio -- 2026-10-01 imprime R$ 3.400,50; testes com fuso, duplicatas e canceladas passam.
Tarefa 4: prazoSLA respeita dia seguinte, fim de semana e feriados; npm run feriados -- 2026 gera o arquivo; tela mostra coluna de prazo com SLA 3.
Tarefa 5: gerarCSV usa ;, header correto, datas DD/MM/AAAA, campos escapados, BOM UTF-8; botão na tela baixa o arquivo.
Aguardando sua aprovação. Após confirmação, alterno para o modo Act e começo pela Tarefa 3 (a urgente), seguida das demais na ordem proposta, sempre sem fazer merge das PRs e deixando tudo pronto para sua revisão final antes do preenchimento do STATUS.md e envio do link do repositório.
---------------------------------------------------------------------------------------
Tenho agora a visão completa do projeto. A seguir apresento minha análise e o plano de execução, como solicitado (modo Plan — **nenhum arquivo será modificado**).

---

## 1. Resumo dos requisitos e regras de entrega (README.md)

### Contexto de negócio
As empresas estão organizadas em árvore:

```
Grupo Aurora (1)
├── Aurora Serviços (2)
│   └── Aurora Campo (4)
└── Vértice Finanças (3)
Outra Empresa S.A. (5)  ← independente, fora do grupo
```

**Regra de ouro:** quem escolhe uma empresa vê os dados dela **e de todas as empresas abaixo**. Quem escolhe o Grupo Aurora vê tudo do grupo. Ninguém do grupo vê a Outra Empresa S.A., e ela não vê ninguém do grupo.

### As cinco tarefas
| Tarefa | Classificação | Problema | Arquivo principal |
|--------|--------------|----------|-------------------|
| Tarefa 3 | 🟥 URGENTE | Cliente da Vértice Finanças vê tarefas da Aurora Serviços e da Outra Empresa S.A. | `sql/schema.sql` (RLS) |
| Tarefa 1 | 🟨 | Tela de tarefas vazia ao escolher Grupo Aurora; tarefa criada no último dia do filtro some | `src/App.jsx`, `src/tarefas.js` |
| Tarefa 2 | 🟦 | Relatório de 01/10/2026 mostra R$ 4.501,00; correto é R$ 3.400,50 | `src/relatorio.js`, `scripts/relatorio.js`, `data/vendas.json` |
| Tarefa 4 | 🟩 | Prazo conta dias corridos, deveria ser dias úteis (sex + 1 dia útil vence no sábado) | `src/prazo.js`, `App.jsx` (nova coluna), novo comando `npm run feriados` |
| Tarefa 5 | 🟪 | CSV abre tudo numa coluna só, acentos estranhos, quebra com títulos especiais | `src/exportar.js`, `App.jsx` (botão Exportar CSV) |

### Regras de entrega obrigatórias
1. **Uma branch por tarefa**, nomes exatos: `tarefa-1`, `tarefa-2`, `tarefa-3`, `tarefa-4`, `tarefa-5`, todas saindo da `main`.
2. **Uma Pull Request por tarefa**, de cada branch para a `main` do **seu** repositório. Deixar as PRs **abertas, sem fazer merge**. Descrição da PR deve explicar problema, correção e **como provou que funciona**.
3. Na `main`, preencher `STATUS.md` e fazer commit.
4. Na `main`, salvar na pasta `sessoes/` o histórico das conversas com IA (`.md`, via `/export` no Claude Code ou colagem manual).
5. Enviar link do repositório pelo WhatsApp.

### O que avaliam
- Correções funcionam de verdade, inclusive em casos fora dos testes existentes.
- Provar o que se diz (testes, números, comparações).
- Organização: branches, PRs e status claros.
- Investigação: achar a causa, não só o sintoma.
- Olhar além do pedido: relatar outros problemas no `STATUS.md`.
- Honestidade sobre o que não deu para terminar.

### Restrições de código explicitadas no README
- Tarefa 1: manter nome e parâmetros de `listarTarefas`. Filtro de período **inclusive nos dois dias** (`de` até `ate`).
- Tarefa 2: não editar `data/vendas.json` (é substituído pela sincronização automática). Corrigir o código. Manter nomes e parâmetros das funções de `src/relatorio.js`.
- Tarefa 3: manter tabelas e colunas como estão.
- Tarefa 4: manter nome e parâmetros de `prazoSLA`. Feriados vêm da internet (API pública brasileira), **não digitar à mão**. Criar `npm run feriados -- 2026` que salva `data/feriados-2026.json` e fazer commit desse arquivo. SLA de 3 dias úteis numa coluna nova da tela.
- Tarefa 5: manter nome e parâmetros de `gerarCSV`. Separador `;`, header `id;titulo;status;criada_em`, datas `DD/MM/AAAA`, abrir no Excel com acentos certos e cada campo na sua coluna "seja qual for o título". Botão "Exportar CSV" na tela.

---

## 2. Estrutura do projeto e arquivos envolvidos por tarefa

### Estrutura geral (fora `node_modules/` e `.git/`)
```
data/          empresas.json, tarefas.json, vendas.json  (dados de referência)
sql/           schema.sql                                (DDL + políticas RLS)
scripts/       db.js (consulta SQL como empresa), relatorio.js (CLI do relatório)
src/           App.jsx (tela React), tarefas.js, relatorio.js, prazo.js, exportar.js, main.jsx
test/          tarefas.test.js, relatorio.test.js        (vitest)
sessoes/       .gitkeep                                  (histórico de sessões IA)
STATUS.md      (template a preencher na main)
package.json   (scripts: dev, test, relatorio, db)
```

### Arquivos por tarefa
- **Tarefa 1:** `src/tarefas.js` (lógica de filtro), `src/App.jsx` (tela), `data/tarefas.json`, `data/empresas.json` (leitura), `test/tarefas.test.js`.
- **Tarefa 2:** `src/relatorio.js` (`totalDoDia`, `ticketMedio`), `scripts/relatorio.js`, `data/vendas.json` (somente leitura), `test/relatorio.test.js`.
- **Tarefa 3:** `sql/schema.sql` (políticas RLS), `scripts/db.js` (validação), `src/tarefas.js` (equivalente no frontend — embora o problema reportado seja do banco, o frontend também filtra por `empresa_id ===` exato e precisa da mesma hierarquia para consistência com a tela).
- **Tarefa 4:** `src/prazo.js` (`prazoSLA`), novo script `scripts/feriados.js` (a criar), novo `data/feriados-2026.json` (a criar via comando), `src/App.jsx` (coluna de prazo), `package.json` (a adicionar script `feriados`).
- **Tarefa 5:** `src/exportar.js` (`gerarCSV`), `src/App.jsx` (botão de exportação), `data/tarefas.json` (dados de exemplo com títulos perigosos: aspas, vírgulas, `=SOMA(...)`).

---

## 3. Investigação das causas de cada problema (fatos verificados vs hipóteses)

### Tarefa 3 — Isolamento de dados (CAUSA PRINCIPAL IDENTIFICADA)

**Fatos verificados no `sql/schema.sql`:**
1. `tarefas` tem **RLS habilitado** (`alter table tarefas enable row level security`).
2. Política `tarefas_leitura` (SELECT): `using (empresa_id = current_setting('app.empresa_id', true)::int)` — restringe apenas à **empresa exata**, sem considerar a hierarquia (empresas filhas). Mesmo assim, sozinha não explicaria a Vértice ver tarefas da Aurora e da Outra Empresa.
3. Política `tarefas_importacao`: `for all`, `using (true)`, `with check (true)` — comentada como "liberado para a importação inicial (chamado #412)". Esta política permite **qualquer operação (select, insert, update, delete) sobre qualquer linha de qualquer empresa**, para qualquer usuário. No PostgreSQL, políticas RLS se aplicam por **OR**: se *qualquer* política corresponder, a linha é visível/permitida. Portanto, esta política aberta **anula completamente a restrição** da `tarefas_leitura`.

**Hipótese confirmada por eliminação:** A cliente da Vértice Finanças (empresa 3) vê tarefas da Aurora Serviços (2), Aurora Campo (4) e Outra Empresa S.A. (5) porque a política `tarefas_importacao` com `true` permite a leitura de todas as linhas, independentemente de `app.empresa_id`. É a causa provável do vazamento.

**Problema secundário no frontend:** `src/tarefas.js` filtra `t.empresa_id === empresaId` (exato, sem hierarquia). Escolhendo Grupo Aurora (1), não haveria tarefas com `empresa_id = 1` (todas são de filiais 2, 3, 4), então a tela fica vazia — isso se sobrepõe à Tarefa 1.

**Riscos de isolamento (Tarefa 3):**
- `tarefas_importacao` abre **escrita** (`with check (true)`): qualquer empresa logada pode inserir/alterar/excluir tarefas de **qualquer** empresa, incluindo do grupo concorrente ou da Outra Empresa S.A.
- Não há restrição de hierarquia: mesmo corrigindo a política aberta, a leitura continua restrita à empresa exata (não enxerga filiais).
- Não há política explícita de `INSERT/UPDATE/DELETE` além da importação aberta; após removê-la, é preciso criar políticas de escrita que respeitem a regra do negócio.

### Tarefa 1 — Tela vazia e filtro de período

**Fatos verificados em `src/tarefas.js`:**
- Linha 14: `.filter((t) => t.empresa_id === empresaId)` — filtro exato. Grupo Aurora (1) não tem tarefas próprias → tela vazia. **Causa confirmada.**
- Linha 15: `.filter((t) => t.criada_em > de && t.criada_em < ate)` — comparação estrita. Uma tarefa criada exatamente em `de` ou `ate` é excluída. Exemplo: tarefa 109 criada em `2026-10-01` some se `ate = '2026-10-01'`. **Causa confirmada** ("tarefa criada no último dia do filtro também some").

### Tarefa 2 — Relatório errado (causa confirmada por cálculo)

**Fatos verificados em `data/vendas.json` e `src/relatorio.js`:**
- `totalDoDia` compara `v.criada_em.slice(0, 10) === dia` diretamente no timestamp **UTC** das vendas.
- Cálculo com o código atual para `2026-10-01`:
  - V-0990 (600,00, 02:00Z), V-0991 (1.000,00, 12:00Z), V-0992 (250,50 ×2 duplicados, 15:30Z), V-0994 (1.200,00 ×2 duplicados, 20:00Z) → 600 + 1.000 + 501 + 2.400 = **4.501,00**. **Confere exatamente com o valor reportado como errado.**
- Cálculo correto em **horário de Brasília (UTC-3)**, pagas, sem duplicatas:
  - V-0990: 02:00Z = 23:00 de 30/09 em Brasília → **não conta**.
  - V-0991: 12:00Z = 09:00 de 01/10 → conta (1.000,00).
  - V-0992: 15:30Z = 12:30 de 01/10 → conta uma vez (250,50).
  - V-0994: 20:00Z = 17:00 de 01/10 → conta uma vez (1.200,00).
  - V-0995: 02/10 01:30Z = 01/10 22:30 em Brasília → conta (800,00).
  - V-0996: 02/10 02:45Z = 01/10 23:45 em Brasília → conta (150,00).
  - Total: **1.000 + 250,50 + 1.200 + 800 + 150 = 3.400,50**. **Confere exatamente com o valor esperado.**

**Causas confirmadas (duas):**
1. **Fuso horário:** `slice(0,10)` usa a data UTC, não a data de Brasília. Vendas após 21:00Z "migram" para o dia seguinte; vendas antes de 03:00Z "migram" para o dia anterior.
2. **Duplicatas:** `data/vendas.json` contém registros repetidos (V-0992, V-0994, V-0997 aparecem duas vezes) — fruto da sincronização automática. O código soma duplicados. Como o arquivo não pode ser editado, o código deve deduplicar (por `id`).

`ticketMedio` também depende do mesmo conjunto filtrado e deve ser ajustado para consistência.

### Tarefa 4 — Prazo em dias úteis

**Fato verificado em `src/prazo.js`:**
- `prazoSLA` apenas faz `d.setDate(d.getDate() + dias)`: conta **dias corridos**, a partir do próprio dia de criação, sem considerar fins de semana nem feriados. **Causa confirmada.** Tarefa de sexta + 1 dia útil vence no sábado (deveria ser segunda).

**Requisitos a implementar:**
- Começar a contar no **dia seguinte** à criação.
- Dia útil = segunda a sexta, exceto feriados nacionais.
- Feriados via API pública brasileira (não digitar à mão). Candidata: **BrasilAPI** (`https://brasilapi.com.br/api/feriados/v1/2026`) — a confirmar se funciona sem chave no ambiente. Marcar como hipótese a validar na implementação.
- Criar `npm run feriados -- 2026` → salva `data/feriados-2026.json` → commit desse arquivo.
- Tela: nova coluna com prazo, SLA de 3 dias úteis.
- Manter assinatura `prazoSLA(criadaEm, dias, feriados)`.

### Tarefa 5 — Exportar CSV

**Fatos verificados em `src/exportar.js`:**
- Separador `,` (deve ser `;`).
- Header `id,titulo,status,criada_em` (deve ser `id;titulo;status;criada_em`).
- Data `criada_em` crua `YYYY-MM-DD` (deve ser `DD/MM/AAAA`).
- **Não escapa campos:** título 112 tem aspas (`Treinamento "Vendas 2026"; turma 1`), título 114 começa com `=SOMA(despesas)` (injeção de fórmula no Excel) — ambos quebram "cada campo na sua coluna" e podem ser interpretados como fórmula.
- Sem BOM/UTF-8 correto → acentos estranhos no Excel.
- `src/App.jsx` não tem botão de exportação.

---

## 4. Testes atuais e cenários adicionais necessários

### Testes existentes
- `test/tarefas.test.js`: 1 teste — Vértice (3) em setembro retorna `[105, 106]`. Com correção de hierarquia, Vértice não tem filhas, então continua passando.
- `test/relatorio.test.js`: 1 teste — `totalDoDia` soma só pagas com dados sintéticos em UTC no mesmo dia. Continua passando se a lógica de filtro por pagamento for mantida.

### Cenários adicionais a testar (não existem ainda)

**Tarefa 1 (`listarTarefas`):**
- Grupo Aurora (1) deve ver tarefas de 1, 2, 3 e 4 (todas do grupo), nunca a 5.
- Aurora Serviços (2) vê 2 e 4; Aurora Campo (4) vê só 4; Vértice (3) vê só 3; Outra Empresa (5) vê só 5.
- Período inclusivo: tarefa criada exatamente em `de` e exatamente em `ate` deve aparecer.
- Ordenação por `criada_em`.

**Tarefa 2 (`totalDoDia` / `ticketMedio`):**
- `totalDoDia(vendas, '2026-10-01')` com o arquivo real deve retornar `3400.50`.
- Venda às 02:00Z de 01/10 (23:00 de 30/09 em BR) não conta para 01/10.
- Venda às 01:30Z de 02/10 (22:30 de 01/10 em BR) conta para 01/10.
- Duplicatas por `id` contam uma vez só.
- Vendas canceladas não somam.
- `ticketMedio` consistente com o conjunto deduplicado e convertido.

**Tarefa 3 (validação via `npm run db`):**
- Empresa 3 (Vértice) não vê tarefas de 2, 4 nem 5.
- Empresa 1 (Grupo Aurora) vê tarefas de 1, 2, 3, 4, mas não 5.
- Empresa 5 vê só 5.
- `INSERT` de tarefa com `empresa_id` de outra empresa deve ser bloqueado.
- `UPDATE`/`DELETE` de tarefa de outra empresa bloqueados.
- Sem `app.empresa_id` definido, nenhuma linha é visível.

**Tarefa 4 (`prazoSLA`):**
- Sexta + 1 dia útil → segunda seguinte (não sábado).
- Feriado nacional não conta como dia útil.
- Contagem começa no dia seguinte à criação.
- Com feriados reais de `data/feriados-2026.json`.

**Tarefa 5 (`gerarCSV`):**
- Separador `;`.
- Header exato `id;titulo;status;criada_em`.
- Datas no formato `DD/MM/AAAA`.
- Título com aspas e ponto-e-vírgula (id 112) escapado corretamente.
- Título `=SOMA(...)` (id 114) tratado como texto, não como fórmula Excel.
- Acentos preservados (UTF-8 com BOM).

---

## 5. Atenção especial à Tarefa 3 — isolamento de dados e regras de acesso

A Tarefa 3 é a mais crítica porque envolve **vazamento de dados entre empresas** (LGPD/segurança).

**Regras de acesso no banco (`sql/schema.sql`):**
- Cada sessão define `app.empresa_id` antes de consultar (feito em `scripts/db.js` linha 32).
- Usuário `app_user` tem `select, insert, update, delete` em todas as tabelas.
- RLS está ligado apenas em `tarefas` (não em `empresas`, mas `empresas` é só referência da árvore).

**O que deve ser feito no SQL (sem alterar tabelas/colunas):**
1. **Remover** a política `tarefas_importacao` (`for all ... true`) — brecha de leitura e escrita irrestrita.
2. **Substituir** `tarefas_leitura` por uma política que inclua a hierarquia:
   ```sql
   empresa_id = current_setting('app.empresa_id', true)::int
   OR empresa_id é descendente de current_setting(...)
   ```
   Isso exige uma função ou CTE recursiva sobre `empresas(pai_id)`.
3. **Criar políticas de `INSERT`, `UPDATE`, `DELETE`** com a mesma regra de hierarquia (só pode criar/alterar tarefas da própria empresa ou de empresas abaixo).
4. No **frontend** (`src/tarefas.js`), aplicar a mesma lógica de hierarquia para que o seletor Grupo Aurora mostre tarefas de toda a árvore.

**Risco técnico:** políticas RLS com subconsulta/CTE recursiva no PGlite (Postgres em memória usado pelo `scripts/db.js`) precisam ser validadas com `npm run db`. Se o PGlite não suportar algo, alternativa é unir IDs válidos na aplicação — mas a correção deve estar no banco, conforme a tarefa pede ("O acesso ao banco está em `sql/schema.sql`").

---

## 6. Restrições que devem ser preservadas (não alterar)

- **Assinaturas de funções:** `listarTarefas({tarefas, empresas, empresaId, de, ate})`, `totalDoDia(vendas, dia)`, `ticketMedio(vendas, dia)`, `formatarBRL(valor)`, `prazoSLA(criadaEm, dias, feriados)`, `gerarCSV(tarefas)`.
- **Tabelas e colunas SQL:** `empresas(id, nome, pai_id)`, `tarefas(id, empresa_id, titulo, status, criada_em)`. Podem ser criadas funções/políticas, mas não mudar DDL existente.
- **Arquivos de referência (não editar):** `data/vendas.json` (expressamente proibido pelo README). Recomendo também não editar `data/tarefas.json` nem `data/empresas.json`.
- **Nomes dos scripts existentes:** `relatorio` e `db` continuam funcionando.
- **Novo comando obrigatório:** `npm run feriados -- 2026` (requer adicionar script ao `package.json` e criar `scripts/feriados.js`).
- **Arquivo `data/feriados-2026.json`:** gerado pelo comando e commitado.

---

## 7. Ordem de implementação, branches, commits e Pull Requests

### Ordem sugerida (priorizando urgência e dependências)
1. **Tarefa 3** — URGENTE (segurança, vazamento de dados).
2. **Tarefa 1** — tela inutilizável para o Grupo Aurora.
3. **Tarefa 2** — dados financeiros incorretos.
4. **Tarefa 4** — prazo/SLA (depende da API de feriados e do arquivo `feriados-2026.json`).
5. **Tarefa 5** — exportação CSV.

### Estratégia de git (exatamente como o README pede)
Tudo a partir do estado atual da `main` (sem fazer merge das PRs):
```
git checkout -b tarefa-3 main   # implementa Tarefa 3
git commit ...
git push origin tarefa-3
# Abrir PR tarefa-3 -> main (aberta, sem merge)

git checkout -b tarefa-1 main   # implementa Tarefa 1
...
# Abrir PR tarefa-1 -> main

... repetir para tarefa-2, tarefa-4, tarefa-5
```

Cada PR deve conter, na descrição: problema, correção e **como provou que funcionar** (testes, comandos, números).

### Na branch `main` (apenas no final, sem fazer merge das PRs):
- Preencher `STATUS.md` e commitar.
- Salvar histórico das sessões de IA em `sessoes/` (arquivos `.md`) e commitar.
- **Não fazer merge das branches de tarefa na main** (PRs devem ficar abertas).

---

## 8. Como preencher `STATUS.md` e registrar sessões em `sessoes/`

### `STATUS.md` (na `main`)
Preencher todos os campos do template existente:
- Nome e tempo total gasto.
- Ordem de trabalho e por quê.
- Para cada tarefa: Situação (pronta/parcial/não comecei), Qual era o problema, Como provei que funciona (números, testes, prints), Link da PR.
- Seção "Encontrei também": outros problemas encontrados que não foram pedidos.
- Seção "O que ficou faltando / o que eu faria com mais tempo": honestidade sobre itens incompletos.

### `sessoes/`
- No Claude Code, usar o comando `/export` em cada sessão de trabalho com IA e salvar o arquivo `.md` resultante em `sessoes/`.
- Se usar outra ferramenta, colar o histórico em `.md` na mesma pasta.
- Pasta já existe com `.gitkeep`; adicionar os arquivos de histórico e commitar na `main`.

---

## 9. Comandos para executar testes e validar cada tarefa (Windows / Git Bash)

| Comando | Propósito |
|---------|-----------|
| `npm test` | Roda todos os testes vitest (atualmente 2 arquivos, 2 testes). Rodar após cada tarefa para garantir regressão. |
| `npm run dev` | Inicia a tela em `http://localhost:5173/`. Validar visualmente Tarefas 1, 4 e 5. |
| `npm run relatorio -- 2026-10-01` | Deve imprimir `Total vendido: R$ 3.400,50` (Tarefa 2). |
| `npm run db -- 3 "select id, empresa_id, titulo from tarefas"` | Consulta como Vértice Finanças. Deve retornar só tarefas da empresa 3 (Tarefa 3). Repetir para empresas 1, 2, 4, 5. |
| `npm run feriados -- 2026` | Baixa feriados nacionais de 2026 e salva `data/feriados-2026.json` (Tarefa 4). |

**Validações específicas por tarefa via `npm run db`:**
- `npm run db -- 1 "select id, empresa_id from tarefas"` → deve conter empresas 1, 2, 3, 4 (não 5).
- `npm run db -- 5 "select id, empresa_id from tarefas"` → só empresa 5.
- Teste de escrita (hipotético, validar bloqueio): `npm run db -- 3 "insert into tarefas values (999, 2, 'invasao', 'aberta', '2026-10-01')"` → deve falhar com erro de RLS.

---

## 10. Riscos identificados

| Tarefa | Risco | Mitigação |
|--------|-------|-----------|
| 3 | PGlite pode não suportar CTE recursiva/funções em políticas RLS | Validar com `npm run db`; ter alternativa pronta |
| 4 | Dependência de internet para a API de feriados (pode falhar offline) | Testar a API candidata (BrasilAPI); ter plano de fallback com arquivo salvo |
| 4 | Fuso horário na leitura de `criada_em` (`YYYY-MM-DD`) | Usar `toISOString().slice(0,10)` com cuidado; testar em datas de limite |
| 5 | Injeção de fórmula CSV (`=SOMA(...)`) e títulos com aspas/pontos-e-vírgula | Escapar campos envolvendo em aspas duplas e dobrando aspas internas |
| 5 | Acentos no Excel | Gerar arquivo com BOM UTF-8 (`\uFEFF`) e `text/csv;charset=utf-8` |
| 4/5 | Adicionar script ao `package.json` | Edição necessária e permitida (README exige o comando `npm run feriados`) |

---

## Critérios de conclusão de cada tarefa

- **Tarefa 3:** `npm run db` mostra que cada empresa vê só a si e suas filhas; escritas de outras empresas são bloqueadas. Sem vazamento para a Outra Empresa S.A.
- **Tarefa 1:** Grupo Aurora mostra tarefas do grupo; filtro inclui ambos os dias da ponta; testes novos passam.
- **Tarefa 2:** `npm run relatorio -- 2026-10-01` imprime `R$ 3.400,50`; testes com fuso, duplicatas e canceladas passam.
- **Tarefa 4:** `prazoSLA` respeita dia seguinte, fim de semana e feriados; `npm run feriados -- 2026` gera o arquivo; tela mostra coluna de prazo com SLA 3.
- **Tarefa 5:** `gerarCSV` usa `;`, header correto, datas `DD/MM/AAAA`, campos escapados, BOM UTF-8; botão na tela baixa o arquivo.

---

**Aguardando sua aprovação.** Após confirmação, alterno para o modo Act e começo pela Tarefa 3 (a urgente), seguida das demais na ordem proposta, sempre sem fazer merge das PRs e deixando tudo pronto para sua revisão final antes do preenchimento do `STATUS.md` e envio do link do repositório.
---------------------------------------------------------------------------------------
A Tarefa 3 está implementada e validada de ponta a ponta. Segue o relatório final.

---

## Tarefa 3 — Cliente vendo dado de outra empresa: relatório final

### Arquivos modificados

| Arquivo | Status | Justificativa |
|---|---|---|
| `sql/schema.sql` | **Modificado** | Correção da causa raiz: remoção da política permissiva e criação de políticas RLS explícitas para SELECT/INSERT/UPDATE/DELETE com a hierarquia empresarial. |
| `test/rls.test.js` | **Criado** | Testes automatizados (16 casos) que provam o isolamento entre empresas e as permissões de escrita. |
| `data/empresas.json`, `data/tarefas.json` | **Não alterados** | Confirmado via `git diff --name-only -- data/` (vazio). |
| `src/`, `scripts/` | **Não alterados** | Não foi necessário tocar no frontend nem no `scripts/db.js`. Ver "Limitações" abaixo. |

> Nota: `package-lock.json` (modificado) e `sessoes/historico.md` (novo) **já estavam assim antes da minha intervenção** — apareciam no `git status` inicial da sessão. Não os toquei.

### Causa raiz confirmada

A política `tarefas_importacao` em `sql/schema.sql`:
```sql
create policy tarefas_importacao on tarefas
  for all
  using (true)
  with check (true);
```
Em PostgreSQL, políticas RLS se combinam por **OR**: se *qualquer* política casar, a linha é acessível. Com `using (true)`, essa políticapermitia **leitura e escrita em qualquer linha de qualquer empresa** para qualquer usuário, anulando completamente a `tarefas_leitura`. A cliente da Vértice Finanças (empresa 3) via tudo porque a política aberta a deixava ver as empresas 2, 4 e 5.

Problema adicional corrigido: a `tarefas_leitura` original restringia à empresa **exata** (`empresa_id = current_setting(...)`), o que impedia a hierarquia (o Grupo Aurora não enxergaria as filiais). Notei também que essa política original não protegia **escrita** — havia apenas a política aberta para `for all`.

### Estratégia utilizada nas políticas RLS

Quatro políticas explícitas e independentes (uma por operação), todas baseadas no mesmo predicado:

```sql
nullif(current_setting('app.empresa_id', true), '') is not null
and empresa_id in (
  with recursive descendentes as (
    select id from empresas
    where id = nullif(current_setting('app.empresa_id', true), '')::int
    union
    select e.id from empresas e join descendentes d on e.pai_id = d.id
  )
  select id from descendentes
)
```

- **CTE recursivo** desce a árvore por `empresas.pai_id`,_partindo da empresa logada → implementa "própria + descendentes".
- **`nullif(..., '')`**: o PGlite devolve string vazia (não `NULL`) quando `app.empresa_id` não está definido; sem o `nullif` isso causava `invalid input syntax for type integer: ""`. Com o `nullif`, sessão sem empresa → predicado falso → **nenhuma linha** visível ou alterável.
- **INSERT** usa `with check`; **UPDATE** usa `using` (alvo) + `with check` (resultado, impedindo mover tarefa para fora do escopo); **DELETE** usa `using`.
- `empresas` **mantida sem RLS** deliberadamente: é tabela de estrutura (árvore), não de dados de tarefas, e o CTE precisa consultá-la.

### Resultados reais dos testes executados

`npm test`:
```
 ✓ test/relatorio.test.js  (1 test) 3ms
 ✓ test/tarefas.test.js  (1 test) 17ms
 ✓ test/rls.test.js  (16 tests) 1979ms

 Test Files  3 passed (3)
      Tests  18 passed (18)
```
Os 2 testes preexistentes continuam passando (sem regressão).

Validação via `npm run db` (empresa → `empresa_id`s visíveis):

| Empresa | Resultado | Esperado |
|---|---|---|
| 1 Grupo Aurora | 2, 3, 4 | 1,2,3,4 (sem 5) ✔ |
| 2 Aurora Serviços | 2, 4 | 2,4 ✔ |
| 3 Vértice Finanças | 3 | só 3 ✔ |
| 4 Aurora Campo | 4 | só 4 ✔ |
| 5 Outra Empresa S.A. | 5 | só 5 ✔ |

Escritas:
- `npm run db -- 3 "insert into tarefas values (9001, 2, ...)"` → **erro** `new row violates row-level security policy for table "tarefas"` (código 42501) ✔
- `npm run db -- 2 "insert into tarefas values (9002, 4, ...)"` → **permitido** (descendente) ✔
- `npm run db -- 5 "update tarefas ... where id=101"` → 0 linhas afetadas; tarefa 101 conferida intacta ✔
- `npm run db -- 5 "delete from tarefas where id=101"` → 0 linhas afetadas; linha preservada ✔
- Sessão sem `app.empresa_id` → 0 linhas; INSERT bloqueado ✔

### Comandos para você validar manualmente a segurança

```bash
# 1. Cada empresa só vê o que pode (confirme que a 5 nunca aparece para 1/2/3/4)
npm run db -- 1 "select distinct empresa_id from tarefas order by empresa_id"
npm run db -- 2 "select distinct empresa_id from tarefas order by empresa_id"
npm run db -- 3 "select distinct empresa_id from tarefas order by empresa_id"
npm run db -- 4 "select distinct empresa_id from tarefas order by empresa_id"
npm run db -- 5 "select distinct empresa_id from tarefas order by empresa_id"

# 2. INSERT fora do escopo deve falhar com erro de RLS
npm run db -- 3 "insert into tarefas values (9001, 2, 'invasao', 'aberta', '2026-10-01')"
npm run db -- 1 "insert into tarefas values (9002, 5, 'invasao', 'aberta', '2026-10-01')"

# 3. INSERT para descendente deve passar
npm run db -- 2 "insert into tarefas values (9003, 4, 'legitima', 'aberta', '2026-10-01')"

# 4. UPDATE/DELETE fora do escopo não podem afetar nada
npm run db -- 5 "update tarefas set titulo='invasao' where id=101"
npm run db -- 5 "delete from tarefas where id=101"

# 5. Suíte completa
npm test
```

### Limitações e riscos remanescentes

1. **Frontend ainda filtra por empresa exata.** `src/tarefas.js` usa `t.empresa_id === empresaId`. O backend agora está correto, mas a **tela** não reflete a hierarquia (é o sintoma da Tarefa 1, com o qual o filtro por hierarquia se sobrepõe). **Não alterei** o frontend porque a Tarefa 1 vai mexer exatamente nessa função e no filtro de período — mexer agora criaria conflito de merge entre as branches e misturaria escopos. Recomendo resolver a hierarquia do `listarTarefas` na Tarefa 1, reaproveitando a mesma lógica de descendentes.
2. **RLS não protege a tabela `empresas`.** Não era o escopo pedido, e ela só guarda a estrutura de navegação. Mas note: qualquer papel com `select` em `empresas` vê a árvore completa — o que é aceitável, pois a lista de empresas é pública para o seletor.
3. **Comportamento silencioso em UPDATE/DELETE.** O Postgres filtra linhas sem erro (0 linhas afetadas), em vez de lançar exceção. Isso é o padrão do RLS e está coberto pelos testes via `affectedRows`. Se a empresa preferir erro explícito ao usuário, dá para adicionar validação na camada de aplicação.
4. **`app.empresa_id` deve ser setado com `set_config(..., false)`** (sessão, não transação) antes de qualquer consulta — `scripts/db.js` já faz isso e não precisou de ajuste.
5. **Compatibilidade com PGlite confirmada:** o CTE recursivo dentro de políticas RLS funciona no Postgres embarcado (todas as 16 asserções e os comandos `npm run db` passaram).

Nenhum commit, push, merge ou PR foi feito, conforme combinado. O `git status` mostra apenas `sql/schema.sql` modificado e `test/rls.test.js` novo (além das alterações pré-existentes de `package-lock.json` e `sessoes/historico.md`).
---------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------