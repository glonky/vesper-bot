import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { ReadyEvent } from '@vesper-discord/discord-service';
import { VesperService } from '@vesper-discord/vesper-service';
import { unwrap } from '@vesper-discord/utils';
import { Config } from '../config';

export default <ReadyEvent>{
  async execute({ client }) {
    const config = Container.get(Config);
    const logger = Container.get(Logger);
    logger.setName('Ready');

    const vesperService = Container.get(VesperService);

    logger.info(`Ready! Logged in`, {
      tag: client.user?.tag,
    });

    await updateBotPresenceWithExchangeRatePrice();

    setInterval(async () => {
      await updateBotPresenceWithExchangeRatePrice();
    }, config.refreshInterval);

    async function updateBotPresenceWithExchangeRatePrice() {
      const { vvspToVSPRatio, vspToVVSPRatio } = await vesperService.getExchangeRate();

      try {
        client.user?.setPresence({
          activities: [
            {
              name: unwrap`
              1 VSP = ${vspToVVSPRatio.toFixed(3)} vVSP
              1 vVSP = ${vvspToVSPRatio.toFixed(3)} VSP
              `,
            },
          ],
        });
      } catch (err) {
        logger.error('Error when trying to set activity', { error: err as Error });
        // TODO: Report error here
      }
    }
  },
  name: 'ready',
  once: true,
};
