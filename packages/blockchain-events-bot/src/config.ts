import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';
import { discord } from '@vesper-discord/discord-service';

@Service()
export class Config extends BaseConfig {
  token = this.getEnvVar<string>('COMMAND_BOT_DISCORD_TOKEN');

  intents = [discord.Intents.FLAGS.DIRECT_MESSAGES, discord.Intents.FLAGS.GUILD_WEBHOOKS, discord.Intents.FLAGS.GUILDS];
}
