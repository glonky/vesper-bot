// NOTE: I prefer using a JavaScript file for the .eslintrc file (instead of a JSON file) as it supports comments that can be used to better describe rules.
// https://medium.com/trabe/monorepo-setup-with-lerna-and-yarn-workspaces-5d747d7c0e91
module.exports = {
  env: {
    browser: false,
    'cypress/globals': true,
    es6: true,
    'jest/globals': true,
    node: true,
  },
  extends: [
    // Styles
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:json/recommended-with-comments',

    // Typescript stuff
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',

    // jest
    'plugin:cypress/recommended',
    'plugin:jest/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin

    // Prettier stuff
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['.eslintrc.js'],
  parserOptions: {
    // project: ['./tsconfig.json'],
    // Allows for the use of imports
    sourceType: 'module',
  },
  // Specifies the ESLint parser
  plugins: [
    '@typescript-eslint',
    'cypress' /* , 'react' */,
    'jest',
    'jest-formatting',
    'sort-keys-fix',
    'unused-imports',
  ],
  root: true,
  rules: {
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/member-ordering': 'error',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    // TODO: this is not working https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-ordering.md
    '@typescript-eslint/no-implied-eval': 'off',

    '@typescript-eslint/no-parameter-properties': 'off',

    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/return-await': 'off',
    'class-methods-use-this': 'off',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-async-tests': 'error',
    'cypress/no-force': 'warn',
    'cypress/no-unnecessary-waiting': 'error',
    'import/default': 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default-member': 'off',
    // 'import/order': ['error', { groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin'] }],
    'import/order': ['error', { groups: ['builtin', 'external', 'parent', 'sibling', 'index'] }],

    'import/prefer-default-export': 'off',
    indent: 'off',
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'lines-between-class-members': 'error',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-shadow': 'off',
    // '@typescript-eslint/no-floating-promises': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'sort-keys-fix/sort-keys-fix': 'warn',
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      { args: 'after-used', argsIgnorePattern: '^_', vars: 'all', varsIgnorePattern: '^_' },
    ],
  },
  settings: {
    // "import/resolver": {
    //   typescript: {} // this loads <rootdir>/tsconfig.json to eslint
    // },
  },
};
