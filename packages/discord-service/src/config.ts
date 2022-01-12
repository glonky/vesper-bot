import { Intents } from 'discord.js';
import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Config extends BaseConfig {
  clientId = this.getEnvVar<string>('DISCORD_CLIENT_ID');

  clientSecret = this.getEnvVar<string>('DISCORD_CLIENT_SECRET');

  guildId = this.getEnvVar<string>('DISCORD_GUILD_ID');

  intents = [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILDS];

  publicKey = this.getEnvVar<string>('DISCORD_PUBLIC_KEY');

  roles = {
    everyone: this.getEnvVar<string>('DISCORD_ROLES_EVERYONE'),
    internal: this.getEnvVar<string>('DISCORD_ROLES_INTERNAL'),
    testRestricted: this.getEnvVar<string>('DISCORD_ROLES_TEST_RESTRICTED'),
  };

  token = this.getEnvVar<string>('DISCORD_TOKEN');

  commandRateLimit = this.getEnvVar<number>('DISCORD_COMMAND_RATE_LIMIT', 5);
}
