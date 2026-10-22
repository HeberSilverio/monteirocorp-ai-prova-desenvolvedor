// Uso: npm run feriados -- 2026
// Baixa os feriados nacionais do ano na BrasilAPI e salva em data/feriados-AAAA.json
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ANO = process.argv[2];

if (!ANO || !/^\d{4}$/.test(ANO)) {
  console.error('Informe o ano: npm run feriados -- 2026');
  process.exit(1);
}

const API = `https://brasilapi.com.br/api/feriados/v1/${ANO}`;

const resposta = await fetch(API, { headers: { Accept: 'application/json' } });
if (!resposta.ok) {
  console.error(`Falha ao consultar a BrasilAPI (HTTP ${resposta.status}) em ${API}`);
  process.exit(1);
}

const feriados = await resposta.json();
if (!Array.isArray(feriados) || feriados.length === 0) {
  console.error('A API não retornou feriados para o ano informado.');
  process.exit(1);
}

const dados = {
  ano: Number(ANO),
  fonte: API,
  feriados: feriados
    .filter((f) => f.type === 'national')
    .map((f) => ({ date: f.date, name: f.name, type: f.type }))
    .sort((a, b) => a.date.localeCompare(b.date)),
};

const raiz = fileURLToPath(new URL('..', import.meta.url));
mkdirSync(`${raiz}data`, { recursive: true });
const destino = `${raiz}data/feriados-${ANO}.json`;
writeFileSync(destino, `${JSON.stringify(dados, null, 2)}\n`, 'utf8');

console.log(`${dados.feriados.length} feriados nacionais de ${ANO} salvos em data/feriados-${ANO}.json`);
for (const f of dados.feriados) console.log(`  ${f.date}  ${f.name}`);