import Container from 'typedi';
import { Logger } from '../logger';
import { DiscordService } from '../services';

export default {
  execute() {
    const discordService = Container.get(DiscordService);
    Container.get(Logger).info(`Ready! Logged in as ${discordService.client.user?.tag}`);
  },
  name: 'ready',
  once: true,
};
