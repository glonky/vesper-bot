import path from 'path';
import { Intents } from 'discord.js';
import { Service } from 'typedi';
import { BaseConfig } from './base-config';

@Service()
export class Config extends BaseConfig {
  vesper = {
    contractAddress: this.getEnvVar<string>(
      process.env.VESPER_CONTRACT_ADDRESS,
      '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
    ),
  };

  discord = {
    clientId: this.getEnvVar<string>(process.env.DISCORD_CLIENT_ID),
    clientSecret: this.getEnvVar<string>(process.env.DISCORD_CLIENT_SECRET),
    guildId: this.getEnvVar<string>(process.env.DISCORD_GUILD_ID),
    intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILDS],
    publicKey: this.getEnvVar<string>(process.env.DISCORD_PUBLIC_KEY),
    token: this.getEnvVar<string>(process.env.DISCORD_TOKEN),
  };

  logger = {
    enabled: this.getEnvVar<boolean>(process.env.LOG_ENABLED, true),
    level: this.getEnvVar<string>(process.env.LOG_LEVEL, 'info'),
    prettyPrint: this.getEnvVar<boolean>(process.env.LOG_PRETTY_PRINT, false),
    timestamp: this.getEnvVar<boolean>(process.env.LOG_TIMESTAMP, false),
  };

  coinMarketCap = {
    apiKey: this.getEnvVar<string>(process.env.COIN_MARKET_CAP_API_KEY),
  };

  redis = {
    host: this.getEnvVar<string>(process.env.REDIS_TLS_URL ?? process.env.REDIS_URL, 'localhost'),
    ttl: this.getEnvVar<number>(process.env.REDIS_TTL, 60 * 60 * 24), // 1 day
  };

  coinGecko = {
    apiKey: this.getEnvVar<string>(process.env.COIN_GECKO_API_KEY),
    apiVersion: 'v3',
    baseUrl: 'https://api.coingecko.com/api',
    requestsPerSecond: this.getEnvVar<number>(process.env.COIN_GECKO_REQUESTS_PER_SECOND, 10),
    timeout: this.getEnvVar<number>(process.env.COIN_GECKO_TIMEOUT, 30000),
  };

  etherscan = {
    apiKey: this.getEnvVar<string>(process.env.ETHERSCAN_API_KEY),
    baseUrl: 'https://api.etherscan.io/api',
    requestsPerSecond: this.getEnvVar<number>(process.env.ETHERSCAN_REQUESTS_PER_SECOND, 5),
    timeout: this.getEnvVar<number>(process.env.ETHERSCAN_TIMEOUT, 30000),
  };

  protected getPathToEnvFiles() {
    return path.join(__dirname, '..');
  }
}
