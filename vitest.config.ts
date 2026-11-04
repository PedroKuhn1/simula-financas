import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      reporters: ['default', 'junit'],
      outputFile: { junit: './reports/junit.xml' },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
        reporter: ['text', 'html', 'lcov', 'json-summary'],
        reportsDirectory: './coverage',
        // Critério automatizado de qualidade: abaixo destes valores o comando falha e o pipeline para.
        thresholds: {
          lines: 90,
          statements: 90,
          functions: 90,
          branches: 85,
        },
      },
    },
  }),
);
