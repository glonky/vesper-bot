/* eslint-disable @typescript-eslint/no-var-requires */
require('reflect-metadata');
const { BaseConfig } = require('./packages/config/src/base-config');

BaseConfig.loadDotEnvFiles();
