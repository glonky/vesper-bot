/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
require('reflect-metadata');
const { Container } = require('typedi');
const { BaseConfig } = require('./packages/config/dist/base-config.js');
const { RedisService } = require('./packages/redis-service/dist/index.js');

let redisClient;

beforeAll(async () => {
  new BaseConfig().loadDotEnvFiles();
  redisClient = Container.get(RedisService).init();
});

afterAll(async () => {
  try {
    redisClient?.quit();
  } catch (err) {
    console.error('Error in after all jest.env.setup', err);
    throw err;
  }
});

afterEach(async () => {
  Container.reset();
  await redisClient?.flushall();
});
