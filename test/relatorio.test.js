import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { totalDoDia, ticketMedio, formatarBRL } from '../src/relatorio.js';

const vendas = JSON.parse(
  readFileSync(new URL('../data/vendas.json', import.meta.url))
);

describe('totalDoDia', () => {
  it('soma só as vendas pagas', () => {
    const vendas = [
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
      { id: 'B', valor: 50, status: 'cancelada', criada_em: '2026-10-05T16:00:00Z' },
    ];
    expect(totalDoDia(vendas, '2026-10-05')).toBe(100);
  });

  it('ignora vendas canceladas e pendentes', () => {
    const vendas = [
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
      { id: 'B', valor: 50, status: 'cancelada', criada_em: '2026-10-05T16:00:00Z' },
      { id: 'C', valor: 70, status: 'pendente', criada_em: '2026-10-05T17:00:00Z' },
    ];
    expect(totalDoDia(vendas, '2026-10-05')).toBe(100);
  });

  it('usa o horário de Brasília (UTC-3) para definir o dia', () => {
    // 2026-10-02T01:30:00Z é 2026-10-01 22:30 em Brasília.
    const vendas = [
      { id: 'A', valor: 800, status: 'paga', criada_em: '2026-10-02T01:30:00Z' },
    ];
    expect(totalDoDia(vendas, '2026-10-01')).toBe(800);
    expect(totalDoDia(vendas, '2026-10-02')).toBe(0);
  });

  it('não conta venda que no UTC é de outro dia, mas em Brasília é do dia pedido', () => {
    // 2026-10-01T02:00:00Z é 2026-09-30 23:00 em Brasília.
    const vendas = [
      { id: 'A', valor: 600, status: 'paga', criada_em: '2026-10-01T02:00:00Z' },
    ];
    expect(totalDoDia(vendas, '2026-09-30')).toBe(600);
    expect(totalDoDia(vendas, '2026-10-01')).toBe(0);
  });

  it('conta cada venda uma única vez, ignorando duplicatas da sincronização', () => {
    const vendas = [
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
    ];
    expect(totalDoDia(vendas, '2026-10-05')).toBe(100);
  });

  it('não deduplica vendas diferentes com o mesmo valor', () => {
    const vendas = [
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
      { id: 'B', valor: 100, status: 'paga', criada_em: '2026-10-05T16:00:00Z' },
    ];
    expect(totalDoDia(vendas, '2026-10-05')).toBe(200);
  });

  it('retorna 0 para um dia sem vendas', () => {
    expect(totalDoDia(vendas, '2026-01-01')).toBe(0);
  });
});

describe('ticketMedio', () => {
  it('divide o total pelas vendas válidas (sem duplicatas e sem canceladas)', () => {
    const vendas = [
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
      { id: 'B', valor: 300, status: 'paga', criada_em: '2026-10-05T16:00:00Z' },
      { id: 'C', valor: 999, status: 'cancelada', criada_em: '2026-10-05T17:00:00Z' },
      { id: 'A', valor: 100, status: 'paga', criada_em: '2026-10-05T15:00:00Z' },
    ];
    // 400 / 2 vendas válidas = 200 (a duplicata não entra no divisor)
    expect(ticketMedio(vendas, '2026-10-05')).toBe(200);
  });

  it('considera o fuso de Brasília para montar o conjunto de vendas do dia', () => {
    const vendas = [
      { id: 'A', valor: 800, status: 'paga', criada_em: '2026-10-02T01:30:00Z' },
      { id: 'B', valor: 150, status: 'paga', criada_em: '2026-10-02T02:45:00Z' },
    ];
    expect(ticketMedio(vendas, '2026-10-01')).toBe(475);
  });

  it('retorna 0 quando não há vendas no dia', () => {
    expect(ticketMedio(vendas, '2026-01-01')).toBe(0);
  });
});

// O Intl usa espaço não separável (U+00A0) entre "R$" e o valor.
const normalizar = (texto) => texto.replace(/\u00A0/g, ' ');

describe('formatarBRL', () => {
  it('formata em real brasileiro', () => {
    expect(normalizar(formatarBRL(3400.5))).toBe('R$ 3.400,50');
  });
});

describe('dados reais de referência', () => {
  it('total de 01/10/2026 é R$ 3.400,50', () => {
    expect(totalDoDia(vendas, '2026-10-01')).toBe(3400.5);
    expect(normalizar(formatarBRL(totalDoDia(vendas, '2026-10-01')))).toBe(
      'R$ 3.400,50'
    );
  });

  it('ticket médio de 01/10/2026 é R$ 680,10 (5 vendas válidas)', () => {
    expect(ticketMedio(vendas, '2026-10-01')).toBe(680.1);
  });

  it('o dia seguinte, em Brasília, é R$ 3.340,00', () => {
    expect(totalDoDia(vendas, '2026-10-02')).toBe(3340);
  });
});

