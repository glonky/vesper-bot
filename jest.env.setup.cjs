/* eslint-disable @typescript-eslint/no-var-requires */
require('reflect-metadata');
const { BaseConfig } = require('@vesper-discord/config/src/base-config');

new BaseConfig().loadDotEnvFiles();

const { Container } = require('typedi')
const { RedisService } = require('@vesper-discord/redis-service/src')

let redisClient;

beforeAll(() => {
  redisClient = Container.get(RedisService).init();
})

afterAll(async () => {
  try {
    await redisClient?.quit();
 } catch(err) {
    console.error("Error in after all jest.env.setup", err);
    throw err;
 }
})

afterEach(async () => {
  Container.reset();
  await redisClient.flushall()
});