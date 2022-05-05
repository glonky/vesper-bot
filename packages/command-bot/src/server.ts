/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import path from 'node:path';
import { DiscordClient } from '@vesper-discord/discord-service';
import { Container, Service } from 'typedi';
import { Config } from './config';

export interface StartProps {
  startWebsocket?: boolean;
}

@Service()
export class Server {
  public async start(props?: StartProps) {
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

    return discordService.start({ startWebsocket: props?.startWebsocket, token: config.token });
  }
}
