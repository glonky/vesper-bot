import { setupContainer as setupAwsContainer } from '@vesper-discord/aws';
import { PoolRewardEventRepository } from '@vesper-discord/entity-service';
import { Container } from 'typedi';
import { sendRewardAddedMessage } from '../send-reward-added-message';

describe('reward-added-event-handler | sendRewardAddedMessage', () => {
  const container = Container.of('test');

  beforeEach(() => {
    container.reset();
    setupAwsContainer({ container });
  });

  it('should send a message to discord', async () => {
    const poolRewardEventsByPool = await container
      .get(PoolRewardEventRepository)
      .getPoolRewardEventsByPool('veDAI-WBTC Earn Pool');

    const [latestPoolRewardEvent] = poolRewardEventsByPool as any;

    const result = await sendRewardAddedMessage({
      container,
      poolRewardEvent: latestPoolRewardEvent as any,
    });

    expect(result).toBeDefined();
  });
});
