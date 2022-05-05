/* eslint-disable @typescript-eslint/naming-convention */

module.exports = {
  env: {
    es6: true,
    'jest/globals': true,
    node: true,
  },
  extends: [
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:json/recommended-with-comments',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  // NOTE: This fix for "parserOptions.project" has been set for @typescript-eslint/parser
  // https://stackoverflow.com/a/64488474
  overrides: [
    {
      files: ['*.ts'], // Your TypeScript files extension
      parserOptions: {
        //NOTE: tsconfig.json references are not supported yet.
        // this is a workaround
        // https://github.com/typescript-eslint/typescript-eslint/issues/2094#issuecomment-792276816
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
        sourceType: 'module',
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/dot-notation': 'error',
        '@typescript-eslint/no-implied-eval': 'error',
        '@typescript-eslint/no-throw-literal': 'error',
        '@typescript-eslint/return-await': 'error',
      },
    },
  ],

  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sort-keys-fix', 'unused-imports', 'jest', 'jest-formatting', 'prettier'],
  rules: {
    // The following rules need parserOptions. This is defined in the overrides section
    '@typescript-eslint/dot-notation': 'off',

    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/return-await': 'off',

    // 'import/extensions': 'off',
    // 'import/no-unresolved': 'off', // TODO: Turn this off once https://github.com/import-js/eslint-plugin-import/issues/2111#issuecomment-916395538

    'import/order': ['error', { groups: ['builtin', 'external', 'parent', 'sibling', 'index'] }],
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-done-callback': 'off',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'prefer-const': 'error',
    'sort-keys-fix/sort-keys-fix': 'warn',
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      { args: 'after-used', argsIgnorePattern: '^_', vars: 'all', varsIgnorePattern: '^_' },
    ],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
  },
};
