/**
 * Converte um registro de feriado (string 'YYYY-MM-DD' ou objeto com
 * propriedade `date`) para a data no formato 'YYYY-MM-DD'.
 */
function dataFeriado(feriado) {
  if (typeof feriado === 'string') return feriado;
  if (feriado && typeof feriado.date === 'string') return feriado.date;
  return '';
}

/**
 * Verifica se a data 'YYYY-MM-DD' é dia útil: de segunda a sexta e
 * não é feriado nacional.
 */
function ehDiaUtil(data, feriados) {
  const diaDaSemana = new Date(`${data}T00:00:00Z`).getUTCDay();
  if (diaDaSemana === 0 || diaDaSemana === 6) return false;
  return !feriados.includes(data);
}

/**
 * Prazo de atendimento (SLA) de uma tarefa, contado em dias úteis.
 *
 * O prazo começa a contar no dia seguinte à criação. Cada dia útil (segunda a
 * sexta, exceto feriados nacionais) consome um dia do prazo; fins de semana e
 * feriados são pulados.
 *
 * @param {string}   criadaEm   data de criação, 'YYYY-MM-DD'
 * @param {number}   dias       quantos dias o cliente contratou
 * @param {string[]} feriados   datas 'YYYY-MM-DD' (ou objetos com `date`) que não contam
 * @returns {string} data do prazo, 'YYYY-MM-DD'
 */
export function prazoSLA(criadaEm, dias, feriados = []) {
  const lista = (feriados || []).map(dataFeriado).filter(Boolean);
  let restantes = Math.max(0, Number(dias) || 0);

  // A contagem começa no dia seguinte à criação.
  let atual = new Date(`${criadaEm}T00:00:00Z`);
  atual.setUTCDate(atual.getUTCDate() + 1);

  while (restantes > 0) {
    const iso = atual.toISOString().slice(0, 10);
    if (ehDiaUtil(iso, lista)) restantes -= 1;
    if (restantes === 0) return iso;
    atual.setUTCDate(atual.getUTCDate() + 1);
  }

  return atual.toISOString().slice(0, 10);
}

/**
 * Extrai apenas as datas ('YYYY-MM-DD') de uma lista de feriados.
 *
 * @param {Array} feriados lista de feriados em qualquer formato aceito por prazoSLA
 * @returns {string[]} datas dos feriados
 */
export function datasFeriados(feriados = []) {
  return (feriados || []).map(dataFeriado).filter(Boolean).sort();
}
