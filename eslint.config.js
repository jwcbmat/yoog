import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export const baseConfig = tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'],
  },
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  }
);

export default baseConfig;
