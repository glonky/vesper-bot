import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { ReadyEvent } from '@vesper-discord/discord-service';
import { EtherscanService } from '@vesper-discord/etherscan-service';
import { Config } from '../config';

export default <ReadyEvent>{
  async execute({ client }) {
    const config = Container.get(Config);
    const logger = Container.get(Logger);
    logger.setName('Ready');

    const etherscanService = Container.get(EtherscanService);

    logger.info(`Ready! Logged in`, {
      tag: client.user?.tag,
    });

    await updateBotPresenceWithGasPrice();

    setInterval(async () => {
      await updateBotPresenceWithGasPrice();
    }, config.refreshInterval);

    async function updateBotPresenceWithGasPrice() {
      const gas = await etherscanService.getGasOracle();

      try {
        client.user?.setPresence({
          activities: [
            {
              name: `⚡ ${gas.result.FastGasPrice} | 🚶 ${gas.result.ProposeGasPrice} | 🐢 ${gas.result.SafeGasPrice}`,
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
