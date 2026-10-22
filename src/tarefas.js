/**
 * Normaliza uma data para o formato 'YYYY-MM-DD'.
 *
 * `de`, `ate` e `criada_em` chegam como texto. Comparar os textos inteiros
 * funciona para datas, mas quebra se um dos lados vier com hora
 * ('2026-09-01T10:00:00'), porque '2026-09-01T10:00:00' > '2026-09-01'.
 * Por isso cortamos a parte da hora antes de comparar.
 *
 * @param {string|null|undefined} data
 * @returns {string|null} 'YYYY-MM-DD' ou null se não houver data
 */
function soData(data) {
  if (data === null || data === undefined || data === '') return null;
  return String(data).slice(0, 10);
}

/**
 * Monta o conjunto de empresas visíveis para quem escolheu uma empresa:
 * a própria empresa e todas as descendentes dela.
 *
 * A hierarquia vem de `empresas.pai_id`. A travessia é feita por pilha
 * (DFS), usando o conjunto de visitados como guarda: assim uma hierarquia
 * cíclica nos dados não gera laço infinito.
 *
 * @param {Array}  empresas lista de empresas (data/empresas.json)
 * @param {number} empresaId empresa escolhida no seletor
 * @returns {Set<number>|null} ids visíveis, ou null se a empresa não existe
 */
function idsVisiveis(empresas, empresaId) {
  const lista = Array.isArray(empresas) ? empresas : [];
  const id = Number(empresaId);

  const existe = lista.some((e) => Number(e.id) === id);
  if (!existe) return null;

  // indexa os filhos de cada pai (a raiz fica com pai_id null)
  const filhosPorPai = new Map();
  for (const empresa of lista) {
    const pai = empresa.pai_id === null || empresa.pai_id === undefined
      ? null
      : Number(empresa.pai_id);
    if (!filhosPorPai.has(pai)) filhosPorPai.set(pai, []);
    filhosPorPai.get(pai).push(Number(empresa.id));
  }

  const ids = new Set();
  const pilha = [id];
  while (pilha.length > 0) {
    const atual = pilha.pop();
    if (ids.has(atual)) continue; // já visitedo: evita ciclo
    ids.add(atual);
    for (const filho of filhosPorPai.get(atual) || []) pilha.push(filho);
  }

  return ids;
}

/**
 * Lista as tarefas que a pessoa vê quando escolhe uma empresa no seletor.
 *
 * Regras aplicadas (README, seção 2):
 * - quem escolhe uma empresa vê as tarefas dela e de todas as empresas
 *   abaixo dela (descendentes). Empresas independentes ficam de fora;
 * - o filtro de período inclui os dois dias das pontas (de e até).
 *
 * @param {object}   p
 * @param {Array}    p.tarefas   lista de tarefas (data/tarefas.json)
 * @param {Array}    p.empresas  lista de empresas (data/empresas.json)
 * @param {number}   p.empresaId empresa escolhida no seletor
 * @param {string}   p.de        data inicial, 'YYYY-MM-DD'
 * @param {string}   p.ate       data final, 'YYYY-MM-DD'
 * @returns {Array} tarefas ordenadas pela data de criação
 */
export function listarTarefas({ tarefas, empresas, empresaId, de, ate }) {
  const visiveis = idsVisiveis(empresas, empresaId);
  if (!visiveis) return [];

  const inicio = soData(de);
  const fim = soData(ate);

  return tarefas
    .filter((t) => visiveis.has(Number(t.empresa_id)))
    .filter((t) => {
      const criadaEm = soData(t.criada_em);
      if (!criadaEm) return false; // tarefa sem data não entra num período
      if (inicio && criadaEm < inicio) return false;
      if (fim && criadaEm > fim) return false;
      return true;
    })
    .sort((a, b) => a.criada_em.localeCompare(b.criada_em));
}
