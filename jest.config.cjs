/** @type {import('@jest/types').Config.InitialOptions} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./jest.config.shared.cjs');

const config = {
  ...baseConfig,
  projects: ['<rootDir>/packages/!(e2e)/jest.config.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.env.setup.cjs'],
  globalSetup: './jest.global.setup.cjs',
  globalTeardown: './jest.global.teardown.cjs',
};

module.exports = config;
