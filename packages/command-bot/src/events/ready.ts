import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { DiscordService } from '@vesper-discord/discord-service';

export default {
  async execute() {
    const discordService = Container.get(DiscordService);
    Container.get(Logger).info(`Ready! Logged in as ${discordService.client?.user?.tag}`);

    // discordService.client?.user?.setActivity('Vesper', { type: 'PLAYING' });
    // await discordService.botMember?
  },
  name: 'ready',
  once: true,
};
