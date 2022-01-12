/** @type {import('@jest/types').Config.InitialOptions} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./jest.config.shared.cjs');

const config = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/jest.global.setup.cjs'],
};

module.exports = config;
