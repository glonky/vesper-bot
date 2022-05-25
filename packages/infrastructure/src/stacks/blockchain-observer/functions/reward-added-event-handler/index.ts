import 'reflect-metadata';
import { Logger } from '@vesper-discord/logger';
import type { Context, DynamoDBStreamEvent } from 'aws-lambda';
import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { Container } from 'typedi';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { setupContainer as setupAwsContainer } from '@vesper-discord/aws';
import { sendRewardAddedMessage } from './send-reward-added-message';

export async function handler(event: DynamoDBStreamEvent, context: Context): Promise<any> {
  const container = Container.of(context.awsRequestId);
  const logger = container.get(Logger);
  setupAwsContainer({
    container,
  });

  const rewardAddedMessagesSent: any[] = [];

  try {
    await Promise.all(
      event.Records.map(async (record) => {
        if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
          const reward = unmarshall(record.dynamodb.NewImage as { [key: string]: AttributeValue }, {
            wrapNumbers: true,
          });

          const vVspAddress = '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421';
          if (reward.rewardTokenPoolAddress === vVspAddress) {
            logger.info(`Skipping sending reward because it's to VSP`, {
              rewardId: reward.id,
            });
            return;
          }

          await sendRewardAddedMessage({
            container,
            poolRewardEvent: reward as any,
          });
          // TODO: Update db with record that we sent the message, that way if it gets replayed we don't send it again

          logger.debug('Sent message', {
            reward,
            rewardId: reward.id,
          });

          rewardAddedMessagesSent.push(reward);
          // TODO: Update record in DynamoDB to say we have sent the message that way we can test this
        }
      }),
    );
  } catch (err) {
    logger.error('Error sending reward added message to discord', { error: err as Error });
    throw err;
  } finally {
    logger.info('Sent messages', { rewardAddedMessagesSent: rewardAddedMessagesSent.map((r) => r.id) });
  }
}
