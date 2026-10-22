Estamos na branch `tarefa-5` do projeto da prova prática da Monteirocorp AI.

Leia o `README.md` integralmente e identifique os requisitos exatos da **Tarefa 5 — Exportação de tarefas para CSV**.

As Tarefas 1, 2, 3 e 4 já foram realizadas em suas respectivas branches. Não as refaça e não altere suas implementações.

### Escopo da Tarefa 5

Analise e trabalhe exclusivamente nos arquivos relacionados à exportação CSV, especialmente:
- `src/exportar.js`
- `src/App.jsx`
- Testes relacionados à exportação
- Outros arquivos somente se forem indispensáveis ao requisito

### Requisitos
1. Preserve a assinatura da função `gerarCSV(tarefas)`.
2. Utilize o delimitador ponto e vírgula (`;`).
3. Gere exatamente o cabeçalho `id;titulo;status;criada_em`.
4. Formate datas como `DD/MM/YYYY`.
5. Inclua BOM UTF-8 para compatibilidade com Excel.
6. Trate corretamente campos com ponto e vírgula, aspas e quebras de linha.
7. Proteja contra injeção de fórmulas em planilhas, considerando títulos como `=SOMA(...)`.
8. Adicione à interface o botão `Exportar CSV`, conforme o README.
9. Crie ou ajuste testes para os casos exigidos.
10. Preserve o comportamento existente e não altere dados de outras tarefas.

### Forma de trabalho
- Inspecione primeiro o README, os arquivos envolvidos, os testes e o estado da branch.
- Resuma os requisitos e apresente um plano curto.
- Implemente somente a Tarefa 5.
- Execute `npm test` e os testes específicos da exportação.
- Revise as alterações e informe os arquivos modificados e os resultados dos testes.

Não altere `STATUS.md`, não modifique `data/vendas.json` e não faça commit, push, merge nem crie PR. Vou revisar as alterações antes dessas etapas.

Se houver conflito entre o README e o código atual, explique o conflito antes de fazer alterações que possam afetar as tarefas anteriores.
---------------------------------------------------------------------------------------------------------------------------------------
Implementação concluída.

## Requisitos da Tarefa 5 (README §3)
- `gerarCSV(tarefas)`: separador `;`, primeira linha `id;titulo;status;criada_em`, datas `DD/MM/AAAA`, abrir no Excel com acentos certos e **cada campo na sua coluna, seja qual for o título**.
- Botão **"Exportar CSV"** que baixa **as tarefas que estão sendo mostradas**.
- Manter nome e parâmetros de `gerarCSV`.

**Defeitos encontrados no código atual** (`src/exportar.js`): separador `,`; nenhum escape (a tarefa 112 tem `"` e `;` no título); datas em `YYYY-MM-DD`; sem BOM UTF-8 (daí os acentos estranhos); e a tarefa **114** (`=SOMA(despeses) conferir na auditoria`) seria interpretada pelo Excel como fórmula. Exatamente os sintomas relatados.

**Plano executado:** reescrever `gerarCSV` com escape RFC 4180 + BOM + data BR + anti-formula → testes → botão no `App.jsx` com download via Blob.

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/exportar.js` | Assinatura `gerarCSV(tarefas)` **preservada**. Agora: `;` como delimitador; cabeçalho `id;titulo;status;criada_em`; escape RFC 4180 (aspas duplicadas e campo entre aspas quando houver `;`, `"` ou quebra de linha); BOM UTF-8 (`\uFEFF`) no início; datas em `DD/MM/AAAA`; prefixo `'` em campos que começam com `=`, `+`, `-`, `@`, tab ou CR (anti-injeção de fórmula, conteúdo preservado). Exports auxiliares: `escaparCampo`, `protegerFormula`, `formatarDataBR` e `baixarCSV(tarefas, nomeArquivo)` (gera o Blob, dispara o download e devolve o conteúdo). |
| `src/App.jsx` | Botão **"Exportar CSV"** ao lado dos filtros; exporta exatamente a `lista` que está sendo exibida. Nenhuma outra parte da tela foi alterada. |
| `test/exportar.test.js` | **Novo** — 21 testes. |

## Testes executados
- `npx vitest run test/exportar.test.js` → **21 testes, 21 passando**.
- `npm test` (suíte completa) → **3 arquivos, 23 testes, 23 passando** (`relatorio` 1 e `tarefas` 1 intactos, sem regressão).
- **CSV real gerado** com as tarefas 103, 112 e 114:
  ```
  id;titulo;status;criada_em
  103;Visita técnica — Rua das Flores, 42;aberta;10/09/2026
  112;"Treinamento ""Vendas 2026""; turma 1";aberta;03/10/2026
  114;'=SOMA(despesas) conferir na auditoria;aberta;08/10/2026
  ```
  A tarefa 112 fica entre aspas com as aspas internas duplicadas (4 colunas preservadas); a 114 ganha o apóstrofo e deixa de ser fórmula; os acentos de "técnica" e a em-dash estão intactos; BOM `EF BB BF` confirmado.
- **Interface:** renderizei o `App` e confirmei a presença do `<button>Exportar CSV</button>`; o `baixarCSV` foi testado com stubs de DOM (sem adicionar `jsdom` como dependência), verificando que o blob é criado com `text/csv;charset=utf-8`, que o clique dispara com `download="tarefas.csv"` e que a URL é revogada.

## Observações / conflitos (nada foi alterado fora do escopo)
1. **Esta branch `tarefa-5` parte de `main`, que não contém as Tarefas 1–4.** `src/tarefas.js` ainda usa `>`/`<` no filtro e `src/prazo.js` ainda conta dias corridos. Como o enunciado exige que todas as branches saiam da `main`, **não** portei essas correções para cá — só a Tarefa 5, como pedido. Se você quiser esta branch com tudo integrado, é só me avisar que eu faço o merge/porta das Tarefas 1–4.
2. Não adicionei dependência nova ao `package.json` (jsdom ficou de fora); o download é validado por stubs.
3. `STATUS.md` e `data/vendas.json` não foram tocados. Nenhum commit, push, merge ou PR foi feito — `git status` mostra apenas `M src/App.jsx`, `M src/exportar.js` e o novo `test/exportar.test.js`.