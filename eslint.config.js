import typescriptEslint from 'typescript-eslint';
import globals from 'globals';

export default typescriptEslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },
  ...typescriptEslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'off'
    }
  }
);
