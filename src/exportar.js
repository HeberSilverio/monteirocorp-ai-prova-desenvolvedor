/**
 * Caracteres que fazem o Excel/LibreOffice interpretarem o campo como
 * fórmula (CSV injection / formula injection).
 */
const CARACTERES_DE_FORMULA = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Escapa um campo para CSV (RFC 4180): se o valor contiver o delimitador `;`,
 * aspas, quebra de linha ou carriage return, o campo é envolvido em aspas e
 * as aspas internas são duplicadas.
 *
 * @param {string} valor
 * @returns {string} campo pronto para o CSV
 */
export function escaparCampo(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  if (/[";\r\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/**
 * Protege contra injeção de fórmula: um campo que começa com `=`, `+`, `-`,
 * `@`, tab ou carriage return seria executado como fórmula ao ser aberto no
 * Excel. O conteúdo é preservado e o Excel passa a tratá-lo como texto.
 *
 * @param {string} valor
 * @returns {string} campo protegido
 */
export function protegerFormula(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  if (texto.length === 0) return texto;
  return CARACTERES_DE_FORMULA.includes(texto[0]) ? `'${texto}` : texto;
}

/**
 * Converte uma data para o formato brasileiro 'DD/MM/AAAA'.
 *
 * @param {string} data data em 'YYYY-MM-DD' (ou 'YYYY-MM-DDTHH:mm:ss')
 * @returns {string} data em 'DD/MM/AAAA' (ou '' se não houver data)
 */
export function formatarDataBR(data) {
  if (!data) return '';
  const texto = String(data);
  const partes = texto.slice(0, 10).split('-');
  if (partes.length !== 3) return texto;
  const [ano, mes, dia] = partes;
  if (ano.length !== 4) return texto;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Gera o CSV das tarefas para o financeiro abrir no Excel.
 *
 * Formato: separador `;`, primeira linha `id;titulo;status;criada_em`, datas em
 * `DD/MM/AAAA`, campos escapados (aspas, `;` e quebras de linha) e BOM UTF-8
 * no início para o Excel reconhecer a codificação e manter os acentos.
 *
 * @param {Array} tarefas lista de tarefas
 * @returns {string} conteúdo do CSV (já com BOM UTF-8)
 */
export function gerarCSV(tarefas) {
  const cabecalho = 'id;titulo;status;criada_em';

  const linhas = (tarefas || []).map((t) => {
    const campos = [
      t.id,
      t.titulo,
      t.status,
      formatarDataBR(t.criada_em),
    ];
    return campos.map((c) => escaparCampo(protegerFormula(c))).join(';');
  });

  return `﻿${[cabecalho, ...linhas].join('\r\n')}`;
}

/**
 * Gera o CSV e dispara o download no navegador com o nome informado.
 *
 * @param {Array}  tarefas lista de tarefas
 * @param {string} [nomeArquivo] nome do arquivo baixado
 * @returns {string} o conteúdo do CSV gerado
 */
export function baixarCSV(tarefas, nomeArquivo = 'tarefas.csv') {
  const conteudo = gerarCSV(tarefas);
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return conteudo;
}
