import { describe, it, expect } from 'vitest';
import { prazoSLA, datasFeriados } from '../src/prazo.js';
import feriados2026 from '../data/feriados-2026.json';

const FERIADOS = datasFeriados(feriados2026.feriados);

describe('prazoSLA', () => {
  it('conta a partir do dia seguinte à criação', () => {
    // criada na segunda 01/09/2026 -> prazo de 1 dia útil = terça 02/09
    expect(prazoSLA('2026-09-01', 1, FERIADOS)).toBe('2026-09-02');
  });

  it('pula fins de semana', () => {
    // criada na sexta 04/09/2026 -> 1 dia útil: 07/09 é feriado, então é 08/09
    expect(prazoSLA('2026-09-04', 1, FERIADOS)).toBe('2026-09-08');
    // criada na sexta 04/09 com 3 dias úteis -> 08/09, 09/09, 10/09
    expect(prazoSLA('2026-09-04', 3, FERIADOS)).toBe('2026-09-10');
    // criada na sexta 11/09 com 1 dia útil (12/09 é sábado) -> segunda 14/09
    expect(prazoSLA('2026-09-11', 1, FERIADOS)).toBe('2026-09-14');
  });

  it('não conta o dia da criação', () => {
    // criada na sexta 04/09 com 1 dia útil: o prazo não pode ser o próprio sábado 05/09
    expect(prazoSLA('2026-09-04', 1, FERIADOS)).not.toBe('2026-09-05');
  });

  it('pula feriados nacionais', () => {
    // 07/09/2026 é feriado (Independência): criada na sexta 04/09 com 1 dia útil
    // o próximo dia útil é a terça 08/09.
    expect(prazoSLA('2026-09-04', 1, FERIADOS)).toBe('2026-09-08');
    // criada em 07/09 (feriado) com 1 dia útil -> 08/09
    expect(prazoSLA('2026-09-07', 1, FERIADOS)).toBe('2026-09-08');
    // criada na sexta 04/09 com 3 dias úteis -> 08/09, 09/09, 10/09
    expect(prazoSLA('2026-09-04', 3, FERIADOS)).toBe('2026-09-10');
  });

  it('considera feriado no meio do prazo', () => {
    // criada na quarta 16/09 com 3 dias úteis: qui 17, sex 18, (sáb 19, dom 20) seg 21
    expect(prazoSLA('2026-09-16', 3, FERIADOS)).toBe('2026-09-21');
    // 12/10/2026 (segunda) é feriado (Nossa Senhora Aparecida):
    // criada na sexta 09/10 com 2 dias úteis -> 13/10 e 14/10
    expect(prazoSLA('2026-10-09', 2, FERIADOS)).toBe('2026-10-14');
  });

  it('trata tarefas criadas no fim de semana', () => {
    // sábado 05/09/2026 -> contagem começa no domingo (não útil); 07/09 é feriado,
    // então o próximo dia útil é a terça 08/09.
    expect(prazoSLA('2026-09-05', 1, FERIADOS)).toBe('2026-09-08');
    // sábado 12/09 -> domingo 13 não útil, segunda 14/09 é útil
    expect(prazoSLA('2026-09-12', 1, FERIADOS)).toBe('2026-09-14');
  });

  it('aceita lista de feriados vazia', () => {
    expect(prazoSLA('2026-09-04', 1, [])).toBe('2026-09-07');
  });

  it('aceita feriados no formato de objeto da API', () => {
    expect(prazoSLA('2026-09-07', 1, [{ date: '2026-09-07', name: 'Independência', type: 'national' }]))
      .toBe('2026-09-08');
  });

  it('zero dias úteis resulta no dia seguinte à criação', () => {
    expect(prazoSLA('2026-09-01', 0, FERIADOS)).toBe('2026-09-02');
  });

  it('limite: prazo no ano seguinte', () => {
    // criada em 31/12/2026 (quinta) com 1 dia útil -> sexta 01/01/2027
    expect(prazoSLA('2026-12-31', 1, FERIADOS)).toBe('2027-01-01');
    // criada em 30/12/2026 (quarta) com 3 dias úteis -> qui 31/12, sex 01/01 (feriado), seg 04/01
    expect(prazoSLA('2026-12-30', 3, FERIADOS)).toBe('2027-01-04');
  });

  it('não depende do fuso horário do ambiente', () => {
    expect(prazoSLA('2026-09-01', 3, FERIADOS)).toBe('2026-09-04');
  });
});

describe('datasFeriados', () => {
  it('extrai e ordena as datas', () => {
    expect(datasFeriados([{ date: '2026-05-01' }, { date: '2026-01-01' }])).toEqual(['2026-01-01', '2026-05-01']);
  });

  it('aceita strings', () => {
    expect(datasFeriados(['2026-01-01'])).toEqual(['2026-01-01']);
  });
});