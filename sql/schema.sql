-- Banco das tarefas. Cada pessoa logada pertence a UMA empresa, que o
-- servidor grava em app.empresa_id antes de cada consulta.
-- A pessoa vê a própria empresa e as empresas abaixo dela na árvore.

create table empresas (
  id     int primary key,
  nome   text not null,
  pai_id int references empresas(id)
);

create table tarefas (
  id         int primary key,
  empresa_id int not null references empresas(id),
  titulo     text not null,
  status     text not null default 'aberta',
  criada_em  date not null
);

alter table tarefas enable row level security;

-- Políticas de RLS da tabela tarefas.
--
-- Regra de negócio: a empresa logada (app.empresa_id) enxerga e altera
-- tarefas da própria empresa e das empresas descendentes na árvore
-- (filhas, netas, ...). Empresas independentes e empresas ascendentes
-- não são acessíveis.
--
-- O CTE recursivo "descendentes" parte da empresa logada e desce pela
-- árvore usando empresas.pai_id. Por isso a tabela empresas NÃO usa RLS:
-- ela guarda apenas a estrutura de navegação, não dados de tarefas.
--
-- NULLIF transforma a string vazia em NULL: assim uma sessão sem
-- app.empresa_id definido não casa com nenhuma empresa e não vê nem
-- altera nenhuma linha.
--
-- A política "tarefas_importacao" (for all, using true / with check true)
-- foi REMOVIDA de propósito: ela anulava o isolamento e permitia ler e
-- escrever tarefas de qualquer empresa, inclusive de empresas
-- independentes. Era a causa do vazamento reportado pela Vértice Finanças.

-- Leitura: a empresa vê as próprias tarefas e as das empresas abaixo.
create policy tarefas_select on tarefas
  for select
  using (
    nullif(current_setting('app.empresa_id', true), '') is not null
    and empresa_id in (
      with recursive descendentes as (
        select id from empresas
        where id = nullif(current_setting('app.empresa_id', true), '')::int
        union
        select e.id from empresas e join descendentes d on e.pai_id = d.id
      )
      select id from descendentes
    )
  );

-- Inserção: só pode criar tarefa para a própria empresa ou para uma abaixo.
create policy tarefas_insert on tarefas
  for insert
  with check (
    nullif(current_setting('app.empresa_id', true), '') is not null
    and empresa_id in (
      with recursive descendentes as (
        select id from empresas
        where id = nullif(current_setting('app.empresa_id', true), '')::int
        union
        select e.id from empresas e join descendentes d on e.pai_id = d.id
      )
      select id from descendentes
    )
  );

-- Atualização: só pode alterar tarefas visíveis, e o resultado da
-- alteração precisa continuar dentro do escopo permitido.
create policy tarefas_update on tarefas
  for update
  using (
    nullif(current_setting('app.empresa_id', true), '') is not null
    and empresa_id in (
      with recursive descendentes as (
        select id from empresas
        where id = nullif(current_setting('app.empresa_id', true), '')::int
        union
        select e.id from empresas e join descendentes d on e.pai_id = d.id
      )
      select id from descendentes
    )
  )
  with check (
    nullif(current_setting('app.empresa_id', true), '') is not null
    and empresa_id in (
      with recursive descendentes as (
        select id from empresas
        where id = nullif(current_setting('app.empresa_id', true), '')::int
        union
        select e.id from empresas e join descendentes d on e.pai_id = d.id
      )
      select id from descendentes
    )
  );

-- Exclusão: só pode excluir tarefas visíveis.
create policy tarefas_delete on tarefas
  for delete
  using (
    nullif(current_setting('app.empresa_id', true), '') is not null
    and empresa_id in (
      with recursive descendentes as (
        select id from empresas
        where id = nullif(current_setting('app.empresa_id', true), '')::int
        union
        select e.id from empresas e join descendentes d on e.pai_id = d.id
      )
      select id from descendentes
    )
  );
