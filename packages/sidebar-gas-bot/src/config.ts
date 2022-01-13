import { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';
import { Intents } from '@vesper-discord/discord-service';

@Service()
export class Config extends BaseConfig {
  refreshInterval = this.getEnvVar<number>('SIDEBAR_GAS_BOT_REFRESH_INTERVAL', 30000);

  token = this.getEnvVar<string>('SIDEBAR_GAS_BOT_DISCORD_TOKEN');

  intents = [Intents.FLAGS.GUILDS];
}
