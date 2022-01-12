/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import Container, { Service } from 'typedi';
import { DiscordService, RedisService } from './services';

@Service()
export class Server {
  public async start() {
    RedisService.init();
    const discordService = Container.get(DiscordService);

    discordService.setRateLimit();
    discordService.setRestrictToChannels(['900091874973483109']); //bot-spam
    discordService.setRestrictToRoles([{ allowed: false, id: '914346545795698689' }]); // Test Restricted

    await discordService.start();
  }
}
