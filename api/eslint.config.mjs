// ESLint flat config for /api. Formatting is Prettier's job (root .prettierrc);
// eslint-config-prettier switches off the rules that would fight it.
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist/**', 'coverage/**', 'src/generated/**']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      // coding-standards: no `any`, no unused vars/imports (underscore-prefixed args are allowed
      // so Express error handlers can keep their 4-arg signature).
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  prettier,
]);
