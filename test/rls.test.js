import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const schema = ler('sql/schema.sql');
const empresas = JSON.parse(ler('data/empresas.json'));
const tarefas = JSON.parse(ler('data/tarefas.json'));

let db;

async function initDb() {
  db = new PGlite();
  await db.exec(schema);
  for (const e of empresas) {
    await db.query('insert into empresas values ($1, $2, $3)', [e.id, e.nome, e.pai_id]);
  }
  for (const t of tarefas) {
    await db.query('insert into tarefas values ($1, $2, $3, $4, $5)',
      [t.id, t.empresa_id, t.titulo, t.status, t.criada_em]);
  }
  await db.exec(`
    create role app_user;
    grant select, insert, update, delete on all tables in schema public to app_user;
    grant execute on all functions in schema public to app_user;
  `);
}

/** Sessim de uma pessoa logada na empresa `id`. */
async function useEmpresa(id) {
  await db.exec('reset role');
  await db.exec(`select set_config('app.empresa_id', '${id}', false)`);
  await db.exec('set role app_user');
}

/** Sessao sem empresa definida (app.empresa_id vazio). */
async function semEmpresa() {
  await db.exec('reset role');
  await db.exec("select set_config('app.empresa_id', '', false)");
  await db.exec('set role app_user');
}

/** Leitura privilegiada, para conferir o estado real da tabela. */
async function comoDono(sql) {
  await db.exec('reset role');
  return db.query(sql);
}

beforeAll(async () => {
  await initDb();
});

afterAll(async () => {
  await db.close();
});

describe('RLS - isolamento de dados entre empresas', () => {
  it('empresa 1 (Grupo Aurora) ve tarefas das empresas 1,2,3,4 mas nao da 5', async () => {
    await useEmpresa(1);
    const r = await db.query('select id from tarefas order by id');
    const ids = r.rows.map((row) => row.id);
    expect(ids).toEqual([101, 102, 103, 104, 105, 106, 108, 109, 110, 112, 113, 114, 115]);
    expect(ids).not.toContain(107);
    expect(ids).not.toContain(111);
  });

  it('empresa 2 (Aurora Servicos) ve tarefas das empresas 2 e 4', async () => {
    await useEmpresa(2);
    const r = await db.query('select id from tarefas order by id');
    const ids = r.rows.map((row) => row.id);
    expect(ids).toEqual([101, 102, 103, 104, 108, 109, 112, 113, 115]);
  });

  it('empresa 3 (Vertice Financas) ve somente tarefas da empresa 3', async () => {
    await useEmpresa(3);
    const r = await db.query('select id from tarefas order by id');
    const ids = r.rows.map((row) => row.id);
    expect(ids).toEqual([105, 106, 110, 114]);
  });

  it('empresa 4 (Aurora Campo) ve somente tarefas da empresa 4', async () => {
    await useEmpresa(4);
    const r = await db.query('select id from tarefas order by id');
    const ids = r.rows.map((row) => row.id);
    expect(ids).toEqual([103, 104, 109, 113]);
  });

  it('empresa 5 (Outra Empresa S.A.) ve somente tarefas da empresa 5', async () => {
    await useEmpresa(5);
    const r = await db.query('select id from tarefas order by id');
    const ids = r.rows.map((row) => row.id);
    expect(ids).toEqual([107, 111]);
  });

  it('empresa 3 nao ve tarefas da Aurora Servicos nem da Outra Empresa', async () => {
    await useEmpresa(3);
    const r = await db.query('select distinct empresa_id from tarefas order by empresa_id');
    const ids = r.rows.map((row) => row.empresa_id);
    expect(ids).toEqual([3]);
  });

  it('sessao sem app.empresa_id nao enxerga tarefas', async () => {
    await semEmpresa();
    const r = await db.query('select id from tarefas');
    expect(r.rows).toHaveLength(0);
  });

  describe('escrita', () => {
    it('empresa 1 nao pode inserir tarefa da empresa 5', async () => {
      await useEmpresa(1);
      await expect(
        db.query("insert into tarefas values (9001, 5, 'invasao', 'aberta', '2026-10-01')")
      ).rejects.toThrow();
    });

    it('empresa 3 nao pode inserir tarefa da empresa 2', async () => {
      await useEmpresa(3);
      await expect(
        db.query("insert into tarefas values (9002, 2, 'invasao', 'aberta', '2026-10-01')")
      ).rejects.toThrow();
    });

    it('empresa 2 pode inserir tarefa para empresa 4 (descendente)', async () => {
      await useEmpresa(2);
      const r = await db.query("insert into tarefas values (9003, 4, 'tarefa valida', 'aberta', '2026-10-01') returning id");
      expect(r.rows[0].id).toBe(9003);
      await db.query('delete from tarefas where id = 9003');
    });

    it('empresa 3 nao pode atualizar tarefa da empresa 2', async () => {
      await useEmpresa(3);
      const r = await db.query("update tarefas set titulo = 'alterado' where id = 101");
      expect(r.affectedRows).toBe(0);
      const check = await comoDono('select titulo from tarefas where id = 101');
      expect(check.rows[0].titulo).toBe('Revisar proposta do cliente Almeida');
    });

    it('empresa 2 pode atualizar tarefa da empresa 4 (descendente)', async () => {
      await useEmpresa(2);
      const r = await db.query("update tarefas set titulo = 'alterado valido' where id = 103 returning id");
      expect(r.rows[0].id).toBe(103);
      const check = await comoDono('select titulo from tarefas where id = 103');
      expect(check.rows[0].titulo).toBe('alterado valido');
      await db.query("update tarefas set titulo = 'Visita técnica — Rua das Flores, 42' where id = 103");
    });

    it('empresa 5 nao pode excluir tarefa da empresa 2', async () => {
      await useEmpresa(5);
      const r = await db.query('delete from tarefas where id = 101');
      expect(r.affectedRows).toBe(0);
      const check = await comoDono('select id from tarefas where id = 101');
      expect(check.rows).toHaveLength(1);
    });

    it('empresa 4 pode excluir tarefa da empresa 4', async () => {
      await useEmpresa(4);
      await db.query("insert into tarefas values (9004, 4, 'para excluir', 'aberta', '2026-10-01')");
      const r = await db.query('delete from tarefas where id = 9004 returning id');
      expect(r.rows[0].id).toBe(9004);
    });

    it('sessao sem app.empresa_id nao pode inserir tarefa', async () => {
      await semEmpresa();
      await expect(
        db.query("insert into tarefas values (9005, 2, 'invasao', 'aberta', '2026-10-01')")
      ).rejects.toThrow();
    });

    it('sessao sem app.empresa_id nao pode atualizar nem excluir tarefa', async () => {
      await semEmpresa();
      const upd = await db.query("update tarefas set titulo = 'invasao' where id = 101");
      expect(upd.affectedRows).toBe(0);
      const del = await db.query('delete from tarefas where id = 101');
      expect(del.affectedRows).toBe(0);
      const check = await comoDono('select titulo from tarefas where id = 101');
      expect(check.rows[0].titulo).toBe('Revisar proposta do cliente Almeida');
    });
  });
});
