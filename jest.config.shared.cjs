/** @type {import('@jest/types').Config.InitialOptions} */
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
  setupFilesAfterEnv: ['<rootDir>/../../jest.env.setup.cjs'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/e2e/', '<rootDir>/cdk.out', 'node_modules'],
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
};

module.exports = config;
