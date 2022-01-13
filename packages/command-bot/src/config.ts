import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';
import { Intents } from '@vesper-discord/discord-service';

@Service()
export class Config extends BaseConfig {
  clientId = this.getEnvVar<string>('COMMAND_BOT_DISCORD_CLIENT_ID');

  guildId = this.getEnvVar<string>('COMMAND_BOT_DISCORD_GUILD_ID');

  token = this.getEnvVar<string>('COMMAND_BOT_DISCORD_TOKEN');

  commandRateLimit = this.getEnvVar<number>('COMMAND_BOT_DISCORD_COMMAND_RATE_LIMIT', 5);

  intents = [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILDS];
}
