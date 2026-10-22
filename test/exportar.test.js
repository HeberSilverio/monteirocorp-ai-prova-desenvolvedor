import { describe, it, expect } from 'vitest';
import { gerarCSV, baixarCSV, escaparCampo, protegerFormula, formatarDataBR } from '../src/exportar.js';
import tarefas from '../data/tarefas.json';

const BOM = '﻿';

/** Divide o CSV respeitando campos entre aspas (RFC 4180). */
function parseCSV(texto) {
  const conteudo = texto.startsWith(BOM) ? texto.slice(1) : texto;
  const linhas = [];
  let campos = [];
  let campo = '';
  let dentroDeAspas = false;
  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    if (dentroDeAspas) {
      if (c === '"') {
        if (conteudo[i + 1] === '"') { campo += '"'; i++; }
        else dentroDeAspas = false;
      } else campo += c;
      continue;
    }
    if (c === '"') { dentroDeAspas = true; continue; }
    if (c === ';') { campos.push(campo); campo = ''; continue; }
    if (c === '\r' && conteudo[i + 1] === '\n') { campos.push(campo); linhas.push(campos); campos = []; campo = ''; i++; continue; }
    campo += c;
  }
  campos.push(campo);
  linhas.push(campos);
  return linhas;
}

describe('gerarCSV', () => {
  it('usa ponto e vírgula como delimitador', () => {
    const csv = gerarCSV([{ id: 1, titulo: 'Tarefa A', status: 'aberta', criada_em: '2026-09-01' }]);
    expect(csv).toContain('id;titulo;status;criada_em');
    expect(csv.split('\r\n')[1]).toBe('1;Tarefa A;aberta;01/09/2026');
  });

  it('gera exatamente o cabeçalho pedido na primeira linha', () => {
    const csv = gerarCSV([]);
    expect(csv.slice(BOM.length).split('\r\n')[0]).toBe('id;titulo;status;criada_em');
  });

  it('formata as datas em DD/MM/AAAA', () => {
    const csv = gerarCSV([{ id: 1, titulo: 'X', status: 'aberta', criada_em: '2026-10-05' }]);
    expect(csv).toContain('05/10/2026');
    expect(csv).not.toContain('2026-10-05');
  });

  it('começa com BOM UTF-8 para o Excel reconhecer os acentos', () => {
    const csv = gerarCSV([{ id: 1, titulo: 'Visita técnica — Rua das Flores', status: 'aberta', criada_em: '2026-09-10' }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(Buffer.from(csv, 'utf8').subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]));
  });

  it('mantém os acentos intactos (UTF-8)', () => {
    const titulo = 'Visita técnica — Rua das Flores, 42';
    const csv = gerarCSV([{ id: 103, titulo, status: 'aberta', criada_em: '2026-09-10' }]);
    expect(csv).toContain(titulo);
  });

  it('mantém cada campo na sua coluna quando o título tem ponto e vírgula', () => {
    const csv = gerarCSV([{ id: 112, titulo: 'Treinamento "Vendas 2026"; turma 1', status: 'aberta', criada_em: '2026-10-03' }]);
    const linhas = parseCSV(csv);
    expect(linhas[1]).toEqual(['112', 'Treinamento "Vendas 2026"; turma 1', 'aberta', '03/10/2026']);
  });

  it('mantém cada campo na sua coluna quando o título tem quebra de linha', () => {
    const csv = gerarCSV([{ id: 900, titulo: 'Linha 1\nLinha 2', status: 'aberta', criada_em: '2026-09-01' }]);
    const linhas = parseCSV(csv);
    expect(linhas[1]).toEqual(['900', 'Linha 1\nLinha 2', 'aberta', '01/09/2026']);
  });

  it('protege contra injeção de fórmula (tarefa 114)', () => {
    const csv = gerarCSV([{ id: 114, titulo: '=SOMA(despesas) conferir na auditoria', status: 'aberta', criada_em: '2026-10-08' }]);
    expect(csv).toContain("'=SOMA(despesas)");
    expect(csv).not.toMatch(/;\s*=SOMA/);
    const linhas = parseCSV(csv);
    expect(linhas[1][1]).toBe("'=SOMA(despesas) conferir na auditoria");
  });

  it('protege outros prefixos perigosos', () => {
    for (const titulo of ['+1+1', '-2+3', '@SOMA(A1)', '=1+1']) {
      const csv = gerarCSV([{ id: 1, titulo, status: 'aberta', criada_em: '2026-09-01' }]);
      expect(csv).toContain(`'${titulo}`);
    }
  });

  it('não altera campos que não começam com caractere de fórmula', () => {
    const csv = gerarCSV([{ id: 1, titulo: 'Visita técnica — Rua das Flores, 42', status: 'aberta', criada_em: '2026-09-10' }]);
    expect(csv).toContain('Visita técnica — Rua das Flores, 42;aberta');
  });

  it('gera uma linha por tarefa, na ordem recebida', () => {
    const csv = gerarCSV(tarefas);
    const linhas = parseCSV(csv);
    expect(linhas).toHaveLength(tarefas.length + 1);
    expect(linhas[1][0]).toBe(String(tarefas[0].id));
    expect(linhas[linhas.length - 1][0]).toBe(String(tarefas[tarefas.length - 1].id));
  });

  it('funciona com lista vazia (só o cabeçalho)', () => {
    const csv = gerarCSV([]);
    expect(csv).toBe(`${BOM}id;titulo;status;criada_em`);
  });

  it('não usa vírgula como delimitador de coluna', () => {
    const csv = gerarCSV([{ id: 1, titulo: 'a, b', status: 'aberta', criada_em: '2026-09-01' }]);
    const linhas = parseCSV(csv);
    expect(linhas[1]).toEqual(['1', 'a, b', 'aberta', '01/09/2026']);
  });
});

describe('escaparCampo', () => {
  it('envolve em aspas quando há delimitador, aspas ou quebra de linha', () => {
    expect(escaparCampo('a;b')).toBe('"a;b"');
    expect(escaparCampo('a"b')).toBe('"a""b"');
    expect(escaparCampo('a\nb')).toBe('"a\nb"');
  });

  it('deixa o campo como está quando não precisa escapar', () => {
    expect(escaparCampo('simples')).toBe('simples');
  });

  it('trata null/undefined como string vazia', () => {
    expect(escaparCampo(null)).toBe('');
    expect(escaparCampo(undefined)).toBe('');
  });
});

describe('protegerFormula', () => {
  it('prefixa com apóstrofo apenas quando necessário', () => {
    expect(protegerFormula('=1+1')).toBe("'=1+1");
    expect(protegerFormula('normal')).toBe('normal');
    expect(protegerFormula('')).toBe('');
  });
});

describe('baixarCSV', () => {
  it('dispara o download com o nome de arquivo e devolve o conteúdo', () => {
    const globalOriginal = globalThis;
    const clicados = [];
    const revogados = [];

    globalThis.document = {
      body: {
        appendChild: () => {},
        removeChild: () => {},
      },
      createElement: () => ({
        set href(v) { this._href = v; },
        get href() { return this._href; },
        set download(v) { this._download = v; },
        get download() { return this._download; },
        click() { clicados.push(this.download); },
      }),
    };
    globalThis.URL = {
      createObjectURL: () => 'blob:fake-url',
      revokeObjectURL: (u) => revogados.push(u),
    };
    globalThis.Blob = class Blob {
      constructor(partes, opts) { this.partes = partes; this.opts = opts; }
    };

    try {
      const conteudo = baixarCSV([{ id: 1, titulo: 'Tarefa', status: 'aberta', criada_em: '2026-09-01' }]);
      expect(conteudo).toContain('id;titulo;status;criada_em');
      expect(clicados).toEqual(['tarefas.csv']);
      expect(revogados).toEqual(['blob:fake-url']);
    } finally {
      globalThis.document = globalOriginal.document;
      globalThis.URL = globalOriginal.URL;
      globalThis.Blob = globalOriginal.Blob;
    }
  });
});

describe('formatarDataBR', () => {
  it('converte YYYY-MM-DD para DD/MM/AAAA', () => {
    expect(formatarDataBR('2026-09-01')).toBe('01/09/2026');
  });

  it('ignora a parte de hora, se houver', () => {
    expect(formatarDataBR('2026-09-01T12:30:00Z')).toBe('01/09/2026');
  });

  it('devolve string vazia para data ausente', () => {
    expect(formatarDataBR(undefined)).toBe('');
  });
});