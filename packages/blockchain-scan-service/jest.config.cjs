/** @type {import('@jest/types').Config.InitialOptions} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('../../jest.config.shared.cjs');

const config = {
  ...baseConfig,
  displayName: 'blockchain-scan-service',
};

module.exports = config;
