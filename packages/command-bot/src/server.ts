/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import path from 'path';
import { DiscordService } from '@vesper-discord/discord-service';
import { RedisService } from '@vesper-discord/redis-service';
import Container, { Service } from 'typedi';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Server {
  public async start() {
    RedisService.init();
    BaseConfig.loadDotEnvFiles(path.join(__dirname, '../../..'));
    const discordService = Container.get(DiscordService);

    discordService.setRateLimit();
    discordService.setRestrictToChannels(['900091874973483109']); //bot-spam
    discordService.setRestrictToRoles([{ allowed: false, id: '914346545795698689' }]); // Test Restricted

    await discordService.start();
    const commandsPath = path.join(__dirname, 'commands');
    const eventsPath = path.join(__dirname, 'events');
    console.log('commandsPath', commandsPath);
    console.log('eventsPath', eventsPath);
    await discordService.loadCommands(commandsPath);
    await discordService.loadEvents(eventsPath);
  }
}
