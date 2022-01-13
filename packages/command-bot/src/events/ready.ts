import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { DiscordService } from '@vesper-discord/discord-service';

export default {
  async execute() {
    const discordService = Container.get(DiscordService);
    const logger = Container.get(Logger);

    logger.info(`Ready! Logged in`, {
      tag: discordService.client.user?.tag,
    });
  },
  name: 'ready',
  once: true,
};
