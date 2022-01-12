module.exports = {
  env: {
    'jest/globals': true,
    node: true,
    es6:true,
  },
  extends: [
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:json/recommended-with-comments',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'sort-keys-fix', 'unused-imports', 'jest', 'jest-formatting', 'prettier'],
  rules: {
    'import/order': ['error', { groups: ['builtin', 'external', 'parent', 'sibling', 'index'] }],
    '@typescript-eslint/no-use-before-define': 'off',
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-done-callback': 'off',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-const': 'error',
    'react/jsx-no-undef': 'off',
    'react/prop-types': 'off',
    'sort-keys-fix/sort-keys-fix': 'warn',
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      { args: 'after-used', argsIgnorePattern: '^_', vars: 'all', varsIgnorePattern: '^_' },
    ],
  },
};
