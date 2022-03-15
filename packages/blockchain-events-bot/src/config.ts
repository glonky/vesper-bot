import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';
import { Intents } from '@vesper-discord/discord-service';

@Service()
export class Config extends BaseConfig {
  token = this.getEnvVar<string>('COMMAND_BOT_DISCORD_TOKEN');

  intents = [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILDS];
}
