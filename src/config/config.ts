import path from 'path';
import { Intents } from 'discord.js';
import { Service } from 'typedi';
import { BaseConfig } from './base-config';

@Service()
export class Config extends BaseConfig {
  aws = {
    account: this.getEnvVar<string>(process.env.AWS_ACCOUNT),
    mockAwsServices: this.getEnvVar<boolean>(process.env.MOCK_AWS_SERVICES, this.isLocal),
    profile: this.getEnvVar<string>(process.env.AWS_PROFILE, 'shuffl-staging'),
    region: this.getEnvVar<string>(process.env.AWS_REGION, 'us-east-1'),
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

  coinmarketcap = {
    apiKey: this.getEnvVar<string>(process.env.COINMARKETCAP_API_KEY),
  };

  protected getPathToEnvFiles() {
    return path.join(__dirname, '..');
  }
}
