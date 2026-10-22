import { describe, it, expect } from 'vitest';
import empresas from '../data/empresas.json';
import tarefas from '../data/tarefas.json';
import { listarTarefas } from '../src/tarefas.js';

// Período largo, usado quando o teste é sobre a hierarquia e não sobre datas.
const PERIODO_TOTAL = { de: '2026-09-01', ate: '2026-10-31' };

// ids de empresas cujas tarefas aparecem no resultado
const empresasNoResultado = (r) => [...new Set(r.map((t) => t.empresa_id))].sort((a, b) => a - b);

describe('listarTarefas', () => {
  it('lista as tarefas da Vértice Finanças em setembro', () => {
    const r = listarTarefas({ tarefas, empresas, empresaId: 3, de: '2026-09-01', ate: '2026-09-30' });
    expect(r.map((t) => t.id)).toEqual([105, 106]);
  });

  // -------------------------------------------------------------------
  // Hierarquia: a empresa escolhida enxerga a si mesma e as descendentes
  // (README, seção 2 — "Regra do negócio").
  // -------------------------------------------------------------------
  describe('hierarquia de empresas', () => {
    it('Grupo Aurora (1) vê as empresas 1, 2, 3 e 4, mas nunca a 5', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 1, ...PERIODO_TOTAL });
      expect(empresasNoResultado(r)).toEqual([2, 3, 4]); // a 1 não tem tarefas nos dados
      expect(r.map((t) => t.id)).not.toContain(107); // tarefa da empresa 5
      expect(r.map((t) => t.id)).not.toContain(111); // tarefa da empresa 5
    });

    it('Aurora Serviços (2) vê as empresas 2 e 4', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 2, ...PERIODO_TOTAL });
      expect(empresasNoResultado(r)).toEqual([2, 4]);
    });

    it('Aurora Campo (4) vê somente a empresa 4', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 4, ...PERIODO_TOTAL });
      expect(empresasNoResultado(r)).toEqual([4]);
      expect(r.map((t) => t.id)).toEqual([103, 104, 109, 113]);
    });

    it('Vértice Finanças (3) vê somente a empresa 3', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 3, ...PERIODO_TOTAL });
      expect(empresasNoResultado(r)).toEqual([3]);
      expect(r.map((t) => t.id)).toEqual([105, 106, 110, 114]);
    });

    it('Outra Empresa S.A. (5) vê somente a empresa 5', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 5, ...PERIODO_TOTAL });
      expect(empresasNoResultado(r)).toEqual([5]);
      expect(r.map((t) => t.id)).toEqual([107, 111]);
    });

    it('nenhum membro do grupo enxerga a empresa independente 5', () => {
      for (const empresaId of [1, 2, 3, 4]) {
        const r = listarTarefas({ tarefas, empresas, empresaId, ...PERIODO_TOTAL });
        expect(r.map((t) => t.id)).not.toContain(107);
        expect(r.map((t) => t.id)).not.toContain(111);
      }
    });

    it('a hierarquia também vale quando o filtro de período é estreito', () => {
      // 2026-09-10 é o dia da tarefa 103, da Aurora Campo (descendente da 2)
      const r = listarTarefas({ tarefas, empresas, empresaId: 2, de: '2026-09-10', ate: '2026-09-15' });
      expect(r.map((t) => t.id)).toEqual([103, 104]);
    });

    it('empresa inexistente devolve lista vazia', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 999, ...PERIODO_TOTAL });
      expect(r).toEqual([]);
    });
  });

  // -------------------------------------------------------------------
  // Filtro de período: as duas pontas (de e até) são inclusivas.
  // -------------------------------------------------------------------
  describe('filtro de datas', () => {
    it('inclui a tarefa criada exatamente na data inicial (de)', () => {
      // a tarefa 101 foi criada em 2026-09-01, a data inicial do período
      const r = listarTarefas({ tarefas, empresas, empresaId: 2, de: '2026-09-01', ate: '2026-09-30' });
      expect(r.map((t) => t.id)).toContain(101);
      expect(r.map((t) => t.id)).toEqual([101, 102, 103, 104, 108]);
    });

    it('inclui a tarefa criada exatamente na data final (ate)', () => {
      // a tarefa 108 foi criada em 2026-09-30, a data final do período
      const r = listarTarefas({ tarefas, empresas, empresaId: 2, de: '2026-09-01', ate: '2026-09-30' });
      expect(r.map((t) => t.id)).toContain(108);
    });

    it('exclui tarefa anterior à data inicial', () => {
      // 101 (2026-09-01) fica de fora quando o período começa em 2026-09-05
      const r = listarTarefas({ tarefas, empresas, empresaId: 2, de: '2026-09-05', ate: '2026-09-30' });
      expect(r.map((t) => t.id)).not.toContain(101);
      expect(r.map((t) => t.id)).toEqual([102, 103, 104, 108]);
    });

    it('exclui tarefa posterior à data final', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 2, de: '2026-09-01', ate: '2026-09-15' });
      expect(r.map((t) => t.id)).not.toContain(108);
      expect(r.map((t) => t.id)).toEqual([101, 102, 103, 104]);
    });

    it('exclui tarefas fora do intervalo dos dois lados', () => {
      // 101 (2026-09-01) é anterior a `de` e 108 (2026-09-30) é posterior a `ate`
      const r = listarTarefas({ tarefas, empresas, empresaId: 1, de: '2026-09-05', ate: '2026-09-20' });
      expect(r.map((t) => t.id)).not.toContain(101);
      expect(r.map((t) => t.id)).not.toContain(108);
      expect(r.map((t) => t.id)).toEqual([102, 103, 104, 105, 106]);
    });

    it('um período de um único dia mostra a tarefa daquele dia', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 1, de: '2026-10-10', ate: '2026-10-10' });
      expect(r.map((t) => t.id)).toEqual([115]);
    });

    it('inclui a tarefa da data inicial mesmo quando de e ate são o mesmo dia', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 1, de: '2026-09-01', ate: '2026-09-01' });
      expect(r.map((t) => t.id)).toEqual([101]);
    });
  });

  // -------------------------------------------------------------------
  // Ordenação
  // -------------------------------------------------------------------
  describe('ordenação', () => {
    it('mantém a ordenação por criada_em, da mais antiga para a mais recente', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 1, ...PERIODO_TOTAL });
      const datas = r.map((t) => t.criada_em);
      expect(datas).toEqual([...datas].sort((a, b) => a.localeCompare(b)));
      expect(r.map((t) => t.id)).toEqual([101, 102, 103, 104, 105, 106, 108, 109, 110, 112, 113, 114, 115]);
    });

    it('a ordenação continua correta quando o filtro corta o começo da lista', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 1, de: '2026-09-05', ate: '2026-10-31' });
      const datas = r.map((t) => t.criada_em);
      expect(datas).toEqual([...datas].sort((a, b) => a.localeCompare(b)));
      expect(r[0].id).toBe(102);
    });

    it('ordena tarefas de empresas diferentes juntas, da mais antiga para a mais recente', () => {
      const r = listarTarefas({ tarefas, empresas, empresaId: 1, ...PERIODO_TOTAL });
      expect(r.map((t) => [t.id, t.criada_em])).toEqual([
        [101, '2026-09-01'], [102, '2026-09-05'], [103, '2026-09-10'], [104, '2026-09-15'],
        [105, '2026-09-15'], [106, '2026-09-20'], [108, '2026-09-30'], [109, '2026-10-01'],
        [110, '2026-10-01'], [112, '2026-10-03'], [113, '2026-10-05'], [114, '2026-10-08'],
        [115, '2026-10-10'],
      ]);
    });
  });
});
