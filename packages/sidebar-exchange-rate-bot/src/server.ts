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

    const eventsPath = path.join(__dirname, 'events');
    await discordService.loadEvents(eventsPath);

    await discordService.start({
      token: config.token,
    });
  }
}
