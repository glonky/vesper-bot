import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';
import { discord } from '@vesper-discord/discord-service';

@Service()
export class Config extends BaseConfig {
  refreshInterval = this.getEnvVar<number>('SIDEBAR_EXCHANGE_RATE_BOT_REFRESH_INTERVAL', 30000);

  token = this.getEnvVar<string>('SIDEBAR_EXCHANGE_RATE_BOT_DISCORD_TOKEN');

  intents = [discord.Intents.FLAGS.GUILDS];
}
