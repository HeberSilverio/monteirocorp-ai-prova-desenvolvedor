// Relatório de vendas
//
// Regras de negócio:
//  - Os dias do relatório são calculados no horário de Brasília (UTC-3).
//  - Só vendas com status "paga" entram na conta (canceladas e pendentes não).
//  - A sincronização automática pode reenviar a mesma venda: o `id` identifica
//    a venda, então duplicatas são contadas apenas uma vez.
//  - O ticket médio usa exatamente o mesmo conjunto de vendas do total.

/** Deslocamento de Brasília em relação ao UTC, em milissegundos (UTC-3). */
const FUSO_BRASILIA_MS = -3 * 60 * 60 * 1000;

/** Converte um timestamp (ISO 8601) para a data 'YYYY-MM-DD' no horário de Brasília. */
function dataEmBrasilia(timestamp) {
  const ms = Date.parse(timestamp);
  if (Number.isNaN(ms)) return null;
  return new Date(ms + FUSO_BRASILIA_MS).toISOString().slice(0, 10);
}

/**
 * Vendas válidas do dia: pagas, dentro do dia de Brasília e sem duplicatas
 * (a primeira ocorrência de cada `id` vence).
 */
export function vendasValidasDoDia(vendas, dia) {
  const vistas = new Set();
  const resultado = [];

  for (const venda of vendas ?? []) {
    if (!venda || venda.status !== 'paga') continue;

    const id = venda.id ?? Symbol('sem-id');
    if (vistas.has(id)) continue; // duplicata da sincronização

    if (dataEmBrasilia(venda.criada_em) !== dia) continue;

    vistas.add(id);
    resultado.push(venda);
  }

  return resultado;
}

/** Total vendido (só vendas pagas) em um dia 'YYYY-MM-DD'. */
export function totalDoDia(vendas, dia) {
  const total = vendasValidasDoDia(vendas, dia).reduce(
    (soma, v) => soma + (Number(v.valor) || 0),
    0
  );
  // Evita ruído de ponto flutuante em centavos (ex.: 0.1 + 0.2).
  return Math.round(total * 100) / 100;
}

/** Ticket médio do dia: total vendido ÷ número de vendas válidas do dia. */
export function ticketMedio(vendas, dia) {
  const doDia = vendasValidasDoDia(vendas, dia);
  if (doDia.length === 0) return 0;
  return Math.round((totalDoDia(vendas, dia) / doDia.length) * 100) / 100;
}

export function formatarBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
