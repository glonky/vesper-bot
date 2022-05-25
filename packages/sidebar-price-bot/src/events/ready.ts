import { Container } from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { ReadyEvent } from '@vesper-discord/discord-service';
import { EthereumVesperService } from '@vesper-discord/vesper-service';
import { Config } from '../config';

export default <ReadyEvent>{
  async execute({ client }) {
    const config = Container.get(Config);
    const logger = Container.get(Logger);
    logger.setName('Ready');

    const vesperService = Container.get(EthereumVesperService);

    logger.info(`Ready! Logged in`, {
      tag: client.user?.tag,
    });

    await updateBotPresenceWithPrice();

    setInterval(async () => {
      await updateBotPresenceWithPrice();
    }, config.refreshInterval);

    async function updateBotPresenceWithPrice() {
      const { price } = await vesperService.getVspStats();
      const fractionalCurrencyFormatter = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' });

      try {
        client.user?.setPresence({
          activities: [
            {
              name: fractionalCurrencyFormatter.format(price),
              type: 'WATCHING',
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
