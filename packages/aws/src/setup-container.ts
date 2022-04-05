import { ContainerInstance, Container } from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { ApiGatewayManagementApiClientConfig } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { Config } from './config';
import { AWSDynamoDBClientToken } from './clients/dynamo-db/client';

export interface SetupContainerProps {
  container?: ContainerInstance;
  apiGatewayManagementApi?: ApiGatewayManagementApiClientConfig;
  dynamoDBClient?: DynamoDBClientConfig;
}

export async function setupContainer(props?: SetupContainerProps) {
  const container = (props?.container ?? Container) as ContainerInstance;
  const config = container.get(Config);
  const logger = container.get(Logger) || Container.get(Logger);

  container.set(AWSDynamoDBClientToken, new DynamoDBClient(props?.dynamoDBClient ?? {}));

  if (config.captureAwsXray) {
    // stepFunctionsClient = Container.get(AwsXRayRepository).captureAWSClient(stepFunctionsClient);
  }

  // if (config.mockAwsServices) {
  // }

  if (props?.container) {
    logger.trace('Setting up aws container for scoped container', { containerId: props?.container.id });
  } else {
    logger.trace('Setting up aws container for global container');
  }
}
