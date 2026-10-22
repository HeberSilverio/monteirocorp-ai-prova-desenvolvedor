Estamos na branch `tarefa-4` do projeto da prova prática da Monteirocorp AI.

Antes de implementar qualquer coisa, leia o `README.md` integralmente e identifique os requisitos exatos da **Tarefa 4 — Cálculo de prazo SLA considerando dias úteis e feriados nacionais**.

As Tarefas 1, 2 e 3 já foram realizadas. Não as refaça nem altere suas implementações.

### Escopo exclusivo da Tarefa 4

Analise os requisitos do README e trabalhe somente no que for necessário para esta tarefa, considerando os seguintes arquivos:

- `src/prazo.js`
- `src/App.jsx`
- `scripts/feriados.js` — criar se necessário
- `data/feriados-2026.json` — gerar conforme os requisitos
- `package.json` — adicionar o script `feriados`, se necessário
- Testes relacionados à Tarefa 4

### Regras de implementação

1. Preserve a assinatura da função `prazoSLA(criadaEm, dias, feriados)`.
2. Respeite a regra de contagem definida no README: a contagem começa no dia seguinte à criação, considerando dias úteis e excluindo feriados nacionais.
3. Obtenha os feriados de uma API pública brasileira, conforme solicitado no enunciado. Não substitua a consulta por uma lista de feriados escrita manualmente no código.
4. Implemente o comando `npm run feriados -- 2026` para gerar `data/feriados-2026.json`, conforme os requisitos do projeto.
5. Adicione à interface a coluna de SLA de 3 dias úteis solicitada no enunciado, sem modificar funcionalidades fora do escopo.
6. Preserve compatibilidade com a estrutura e as dependências existentes no projeto.
7. Não altere `data/vendas.json`, não modifique o `STATUS.md` e não refaça as Tarefas 1, 2 ou 3.
8. Antes de modificar arquivos compartilhados, leia seu conteúdo atual e faça alterações pontuais, preservando o trabalho já realizado.
9. Acrescente ou ajuste testes para validar a contagem dos dias úteis, fins de semana, feriados e limites de datas.
10. Execute `npm test` e `npm run feriados -- 2026`. Depois, valide a função de SLA e a integração com a interface. Se a API pública estiver indisponível, informe o problema claramente e não invente dados de resposta.

### Forma de trabalho

- Primeiro, inspecione o README, os arquivos envolvidos, os testes existentes e o estado atual da branch.
- Apresente um resumo dos requisitos da Tarefa 4 e um plano curto.
- Em seguida, implemente somente a Tarefa 4.
- Ao finalizar, informe os arquivos alterados, os testes executados e seus resultados.
- Não faça commit, push, merge nem crie PR. Vou revisar as alterações antes dessas etapas.

Se encontrar algum conflito entre o README e o estado atual do código, explique o conflito antes de tomar uma decisão que possa afetar as tarefas já concluídas.