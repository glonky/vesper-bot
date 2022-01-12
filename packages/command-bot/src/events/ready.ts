import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { DiscordService } from '@vesper-discord/discord-service';

export default {
  execute() {
    const discordService = Container.get(DiscordService);
    Container.get(Logger).info(`Ready! Logged in as ${discordService.client?.user?.tag}`);
  },
  name: 'ready',
  once: true,
};
