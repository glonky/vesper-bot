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

  try {
    await Promise.all(
      event.Records.map(async (record) => {
        logger.info('Stream record', { record });

        if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
          const reward = unmarshall(record.dynamodb.NewImage as { [key: string]: AttributeValue }, {
            wrapNumbers: true,
          });

          await sendRewardAddedMessage({
            container,
            poolRewardEvent: reward as any,
          });
          logger.info('Sent message');
          // TODO: Update record in DynamoDB to say we have sent the message that way we can test this
        }
      }),
    );
  } catch (err) {
    logger.error('Error sending reward added message to discord', { error: err as Error });
  }
}
