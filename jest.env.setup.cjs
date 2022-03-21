/* eslint-disable @typescript-eslint/no-var-requires */
require('reflect-metadata');
const { BaseConfig } = require('@vesper-discord/config/src/base-config');

new BaseConfig().loadDotEnvFiles();

