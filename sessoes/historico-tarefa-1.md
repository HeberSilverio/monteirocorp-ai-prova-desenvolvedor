Vamos avançar para a próxima tarefa: 
# Tarefa 1 — Corrigir listagem de tarefas e filtro de datas

Estamos executando a prova técnica da Monteirocorp AI. A Tarefa 3 já foi trabalhada separadamente. Agora vamos implementar exclusivamente a Tarefa 1. Já criei a branch `tarefa-1`, criada a partir da `main` original e já estamos nela.

## Objetivo

Corrigir dois problemas:

1. Ao selecionar o Grupo Aurora, a tela de tarefas fica vazia, embora existam tarefas pertencentes às empresas descendentes.
2. Uma tarefa criada exatamente na data inicial ou final do período selecionado não aparece na listagem.

## Requisitos

1. Leia novamente os requisitos correspondentes à Tarefa 1 no `README.md`.
2. Examine `src/tarefas.js`, `src/App.jsx`, `data/empresas.json`, `data/tarefas.json` e `test/tarefas.test.js`.
3. Confirme a causa dos dois problemas antes de alterar o código.
4. Corrija a função `listarTarefas`, preservando exatamente seu nome e sua assinatura:
   `listarTarefas({tarefas, empresas, empresaId, de, ate})`.
5. Ao selecionar uma empresa, exiba as tarefas dela e de todas as empresas descendentes, respeitando a hierarquia definida no README.
6. Nunca inclua tarefas de empresas independentes ou externas à hierarquia selecionada.
7. Faça com que as datas inicial (`de`) e final (`ate`) sejam inclusivas. Uma tarefa criada exatamente em qualquer uma dessas datas deve aparecer.
8. Preserve a ordenação por `criada_em` e o comportamento esperado da tela.
9. Acrescente testes automatizados para os cenários novos, sem remover ou enfraquecer os testes existentes.
10. Não altere `data/empresas.json` nem `data/tarefas.json`.

## Cenários obrigatórios de teste

- Grupo Aurora (1): deve visualizar tarefas das empresas 1, 2, 3 e 4, mas nunca da empresa 5.
- Aurora Serviços (2): deve visualizar tarefas das empresas 2 e 4.
- Aurora Campo (4): deve visualizar somente tarefas da empresa 4.
- Vértice Finanças (3): deve visualizar somente tarefas da empresa 3.
- Outra Empresa S.A. (5): deve visualizar somente tarefas da empresa 5.
- Uma tarefa na data exata de `de` deve aparecer.
- Uma tarefa na data exata de `ate` deve aparecer.
- Tarefas fora do intervalo não devem aparecer.
- A ordenação dos resultados deve continuar correta.

Use os dados e as funções reais do projeto. Não invente resultados.

## Limites de escopo

- Trabalhe exclusivamente na Tarefa 1.
- Não implemente as Tarefas 2, 3, 4 ou 5.
- Não modifique tabelas, colunas SQL, dados de referência ou dependências.
- Não faça commit, push, merge nem crie Pull Requests.
- Não modifique o histórico de sessão durante esta implementação.
- Não assuma que alterações da branch `tarefa-3` estão presentes. Esta branch deve ser independente e partir da `main`.

## Validação

1. Execute `npm test`.
2. Execute testes adicionais necessários para validar todos os cenários listados.
3. Revise o diff e confirme que somente arquivos relacionados à Tarefa 1 foram alterados.
4. Informe os arquivos modificados, a causa de cada problema, a solução aplicada e os resultados reais dos testes.
5. Se algum teste falhar, investigue e corrija antes de concluir.

Implemente a Tarefa 1 de ponta a ponta e aguarde minha revisão antes de realizar operações Git de entrega.
------------------------------------------------------------------------------------------------------------------
Tarefa 1 implementada e validada de ponta a ponta. O dev server que subi para verificação já foi encerrado.

---

# Tarefa 1 — Corrigir listagem de tarefas e filtro de datas

## Arquivos modificados (apenas 2, ambos da Tarefa 1)

| Arquivo | Mudança |
|---|---|
| `src/tarefas.js` | Correção da `listarTarefas` (hierarquia + datas inclusivas) |
| `test/tarefas.test.js` | 18 novos testes (o existente foi mantido intacto) |

**Não alterados:** `src/App.jsx`, `src/relatorio.js`, `src/exportar.js`, `src/prazo.js`, `sql/`, `data/` (confirmado via `git diff --name-only -- data/ src/App.jsx src/relatorio.js src/exportar.js src/prazo.js sql/` → vazio). Nenhum commit, push, merge ou PR foi feito.

## Causa de cada problema (confirmada antes de alterar o código)

**Problema 1 — tela vazia no Grupo Aurora:**
```js
.filter((t) => t.empresa_id === empresaId)   // ← igualdade exata
```
O filtro exigia `empresa_id` **igual** à empresa escolhida. Como a empresa 1 (Grupo Aurora) **não possui nenhuma tarefa própria** em `data/tarefas.json` (as tarefas da 1 não existem — a 1 é só a raiz da árvore), o resultado era sempre `[]` → "Nenhuma tarefa no período". A regra do README (seção 2) é "a empresa **e todas as empresas abaixo dela**", o que nunca foi implementada no frontend.

**Problema 2 — tarefa da data final some:**
```js
.filter((t) => t.criada_em > de && t.criada_em < ate)   // ← exclusivo
```
Os operadores `>` e `<` são **estritos**, então uma tarefa criada exatamente em `de` ou em `ate` era descartada. O README pede explicitamente "incluir **os dois dias das pontas** (de **e** até)".

## Solução aplicada

Mantive **exatamente** o nome e a assinatura: `listarTarefas({tarefas, empresas, empresaId, de, ate})`.

1. **Hierarquia** — helper `idsVisiveis(empresas, empresaId)`: indexa os filhos por `pai_id` e percorre a árvore com uma pilha (DFS), montando o conjunto `{própria} ∪ descendentes`. Usa o próprio conjunto como guarda de visitados, então uma hierarquia cíclica nos dados não gera laço infinito. Empresa inexistente → `[]`.

2. **Datas inclusivas** — helper `soData(data)`: normaliza para `YYYY-MM-DD` (corta a hora, se houver) e a comparação passa a ser `criadaEm < inicio → descarta` / `criadaEm > fim → descarta`, o que torna as duas pontas inclusivas de forma explícita. Tarefa sem data é descartada.

3. **Preservado**: ordenação por `criada_em` (`localeCompare`), o nome/sigla da função, e o comportamento da tela (`App.jsx` não precisou mudar — o componente já consome a função).

Detalhe extra: normalizar a data também evita que `criada_em` com hora (`'2026-09-01T10:00:00'`) seja comparada de forma errada com `'2026-09-01'`.

## Resultados reais dos testes

`npm test`:
```
 ✓ test/tarefas.test.js  (19 tests) 25ms
 ✓ test/relatorio.test.js  (1 test) 3ms

 Test Files  2 passed (2)
      Tests  20 passed (20)
```
Era **1** teste antes; agora são **20**, todos passando, **sem remover nem enfraquecer** o teste original (`lista as tarefas da Vértice Finanças em setembro` continua lá, idêntico, e continua passando).

### Cenários obrigatórios — todos verificados com os dados reais

| Cenário | Resultado |
|---|---|
| Grupo Aurora (1) | vê empresas 1, 2, 3, 4 — **nunca a 5** ✔ (ids 101–106, 108–115) |
| Aurora Serviços (2) | vê empresas 2 e 4 ✔ (ids 101,102,103,104,108,109,112,113,115) |
| Aurora Campo (4) | vê **somente** a 4 ✔ (ids 103,104,109,113) |
| Vértice Finanças (3) | vê **somente** a 3 ✔ (ids 105,106,110,114) |
| Outra Empresa S.A. (5) | vê **somente** a 5 ✔ (ids 107,111) |
| Tarefa na data exata de `de` | aparece ✔ (tarefa 101, em 2026-09-01) |
| Tarefa na data exata de `ate` | aparece ✔ (tarefa 108, em 2026-09-30) |
| Fora do intervalo | não aparece ✔ (101 e 108 excluídos em 2026-09-05..2026-09-20) |
| Ordenação | preservada ✔ (13 tarefas em ordem crescente de `criada_em`, verificado par a par) |

Validação direta da função (mesmos parâmetros do `App.jsx`):
```
== App.jsx: empresa 1 (Grupo Aurora), periodo padrao 2026-09-01..2026-10-31 ==
linhas na tela: 13 | ids: 101,102,103,104,105,106,108,109,110,112,113,114,115
empresas visiveis: 2,4,3
inclui 107/111 (empresa 5)? false
== data final 2026-09-30 == ids: 101,102,103,104,105,106,108   (108 presente ✔)
== data inicial 2026-09-01 == inclui 101? true                  ✔
== emp 5 (independente) == ids: 107,111
```
O app React também sobe sem erro (`npm run dev` → Vite pronto, HTTP 200 na rota principal e no módulo `src/tarefas.js` já servindo a versão corrigida).

### Observação sobre um teste que falhou no caminho

O teste `exclui tarefas fora do intervalo dos dois lados` falhou na primeira execução: eu havia escrito o intervalo `2026-09-15..2026-09-20` esperando `[105, 106]`, mas a tarefa **104 (2026-09-15)** é da **Aurora Campo**, descendente da Aurora Serviços — logo entra corretamente no resultado do Grupo Aurora. **O erro estava na minha expectativa de teste, não no código**; ajustei o intervalo para `2026-09-05..2026-09-20`, onde 101 (anterior a `de`) e 108 (posterior a `ate`) são excluídos com clareza. Corrigido, a suíte passou 20/20.

## Como você pode validar manualmente

```bash
npm test
npm run dev     # abra http://localhost:5173 e escolha "Grupo Aurora" — a tela não deve ficar vazia
```

Na tela, com o período padrão (01/09 a 31/10), o Grupo Aurora deve mostrar **13 linhas** (ids 101–106, 108–115) e **nenhuma** tarefa da Outra Empresa S.A. (ids 107 e 111). Mudando "Até" para `2026-09-30`, a tarefa 108 (criada em 30/09) deve continuar aparecendo — antes sumia.

## Pontos de atenção / riscos residuais

1. **A hierarquia agora existe em dois lugares** — no banco (RLS, Tarefa 3) e no frontend (esta tarefa). As duas implementações seguem a mesma regra e produzem o mesmo conjunto nos dados atuais, mas são código duplicado: uma mudança futura na árvore (`empresas.json`) precisa ser refletida nos dois lados. Um teste de paridade entre RLS e `listarTarefas` seria o próximo passo natural.
2. **O filtro é por `empresa_id` da tarefa**, e não por pertencimento do usuário à empresa. Se um dia o usuário puder pertencer a várias empresas, o modelo atual (uma empresa escolhida no seletor) precisaria ser revisto.
3. **A comparação de datas é textual sobre `YYYY-MM-DD`**, o que é correto para esse formato. Se `criada_em` passar a vir em ISO com fuso (`2026-09-01T00:00:00-03:00`), a data local Continua correta (o corte `slice(0,10)` pega o dia local da string), mas vale revisar se o backend gravar em UTC — nesse caso a data exibida could differs da data "de negócio".
4. `sessoes/historico-tarefa-1.md` aparece como arquivo **não rastreado** (criado automaticamente pela ferramenta, não por mim). Não o commitei, conforme a instrução de não mexer no histórico de sessão nesta implementação.

Estou aguardando sua revisão. Quando aprovar, os comandos de entrega serão:
```bash
git add src/tarefas.js test/tarefas.test.js
git commit -m "fix: corrige listagem hierarquica de tarefas e filtro de datas inclusivo"
git push -u origin tarefa-1
```
E a PR `tarefa-1` → `main`, **aberta e sem merge**.