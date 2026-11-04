// Converte coverage/coverage-summary.json numa tabela Markdown para o resumo do GitHub Actions.
import { readFileSync } from 'node:fs';

const { total } = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
const metrics = { lines: 'Linhas', statements: 'Statements', functions: 'Funções', branches: 'Branches' };

const rows = Object.entries(metrics).map(
  ([key, label]) => `| ${label} | ${total[key].pct}% | ${total[key].covered}/${total[key].total} |`,
);
console.log(['### Cobertura de testes', '', '| Métrica | % | Cobertos |', '| --- | --- | --- |', ...rows].join('\n'));
