/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import path from 'path';
import { DiscordClient } from '@vesper-discord/discord-service';
import Container, { Service } from 'typedi';
import { Config } from './config';

@Service()
export class Server {
  public async start() {
    const config = Container.get(Config);
    const discordService = new DiscordClient({
      intents: config.intents,
    });

    discordService.setRateLimit(config.commandRateLimit);
    discordService.setRestrictToChannels(['900091874973483109']); //bot-spam
    discordService.setRestrictToRoles([{ allowed: false, id: '914346545795698689' }]); // Test Restricted

    const commandsPath = path.join(__dirname, 'commands');
    const eventsPath = path.join(__dirname, 'events');
    await discordService.loadCommands(commandsPath);
    await discordService.loadEvents(eventsPath);

    await discordService.start({ token: config.token });
  }
}
