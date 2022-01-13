import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { ReadyEvent } from '@vesper-discord/discord-service';

export default <ReadyEvent>{
  async execute({ client }) {
    const logger = Container.get(Logger);

    logger.info(`Ready! Logged in`, {
      tag: client.user?.tag,
    });
  },
  name: 'ready',
  once: true,
};
