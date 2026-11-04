import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'reports', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Regras que usam as informações de tipo do TypeScript (análise estática mais profunda).
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      // Code smells, complexidade cognitiva e bugs comuns (mesmo motor de regras do SonarQube).
      sonarjs.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 10],
      complexity: ['error', 10],
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
      // Números em template strings (`${meses} meses`) são seguros; outros tipos continuam proibidos.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Permite o padrão idiomático do React: onChange={(e) => setValor(e.target.value)}.
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      eqeqeq: 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      // Blocos describe() são longos por natureza.
      'max-lines-per-function': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
  // Desliga regras de formatação que conflitam com o Prettier (precisa ser a última).
  prettier,
);
