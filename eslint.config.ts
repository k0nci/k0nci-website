import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  // Ignore auto-generated files
  { ignores: ['.astro/**', 'dist/**', 'node_modules/**'] },

  // Base JavaScript and TypeScript configs
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ['**/*.{ts,mts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React hooks rules for islands
  {
    files: ['**/*.tsx'],
    extends: [reactHooks.configs.flat.recommended],
  },

  // Astro-specific configs
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
