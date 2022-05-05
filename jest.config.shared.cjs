/** @type {import('@jest/types').Config.InitialOptions} */
// const esModules = [
//   'glob',
//   'pkg-dir',
//   'node-fetch',
//   'lodash',
//   'data-uri-to-buffer',
//   'fetch-blob',
//   'formdata-polyfill',
// ].join('|');

const config = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/config.ts',
    '!<rootDir>/src/**/__tests__/**/*',
  ],
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  // extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // moduleNameMapper: {
  //   '^(\\.{1,2}/.*)\\.js$': '$1',
  // },
  reporters: ['default', 'github-actions'],
  setupFilesAfterEnv: ['<rootDir>/../../jest.env.setup.cjs'],
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/cdk.out',
    'node_modules',
  ],
  transform: {
    '^.+\\.(t|j)sx?$': ['esbuild-jest', { sourcemap: true }],
    // '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  // transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};

module.exports = config;
