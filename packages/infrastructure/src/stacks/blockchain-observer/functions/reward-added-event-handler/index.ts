import { Logger } from '@vesper-discord/logger';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import Container from 'typedi';
import { Config } from '../../../../config';

interface ResponseEventDetails {
  message: string;
  unitId: string;
}

export async function handler(
  event: EventBridgeEvent<'EventResponse', ResponseEventDetails>,
  context: Context,
): Promise<any> {
  const container = Container.of(context.awsRequestId);
  const config = container.get(Config);
  const logger = container.get(Logger);
  // setupContainer({
  //   apiGatewayManagementApi: {
  //     endpoint: config.aws.resources.apiGateway.graphQLWebsocketManagementApiEndpoint,
  //   },
  //   container: container,
  // });
  // const connections = await container.get(DynamoDBClient).query({
  //   ExpressionAttributeValues: {
  //     unitId: event.detail.unitId,
  //   },
  //   KeyConditionExpression: 'unitId = :unitId',
  // });

  // await Promise
  // .all
  // (connections.Items ?? []).map(async (connection) => {
  //   const connectionId = connection.pk;
  //   const dataToSendBuffer = Buffer.from(JSON.stringify({ connectionId, message: event.detail.message }));
  //   const dataToSendJson = JSON.stringify({ connectionId, message: event.detail.message });

  //   logger.debug('WebSocket got message', { connectionId, dataToSendBuffer, dataToSendJson });

  //   // return container.get(ApiGatewayManagementApiClient).postToConnection({
  //   //   ConnectionId: connectionId,
  //   //   Data: dataToSendBuffer,
  //   // });
  // }),
  // ();

  // TODO: Lookup reward added hash details
  // Parse transaction
  // write to database
  return {};
}
