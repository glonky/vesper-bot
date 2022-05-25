import 'reflect-metadata';
import type { Context, CloudWatchLogsEvent } from 'aws-lambda';
import { EthereumRewardAddedEventHandler } from '@vesper-discord/vesper-service';
import { setupContainer as setupAwsContainer } from '@vesper-discord/aws';
import { Container } from 'typedi';
import { RedisService } from '@vesper-discord/redis-service';

export async function handler(event: CloudWatchLogsEvent, context: Context): Promise<any> {
  const container = Container.of(context.awsRequestId);
  Container.get(RedisService).init();
  setupAwsContainer({
    container,
  });

  await container.get(EthereumRewardAddedEventHandler).backfill({ poolContractVersion: 3 });
  await container.get(EthereumRewardAddedEventHandler).backfill({ poolContractVersion: 4 });
  // await container.get(PolygonRewardAddedEventHandler).backfill({ poolContractVersion: 3 });
  // await container.get(PolygonRewardAddedEventHandler).backfill({ poolContractVersion: 4 });

  // await container.get(AvalancheRewardAddedEventHandler).backfill();
}
