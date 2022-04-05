import path from 'path';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Database } from '../shared-resources/database';

export interface RewardAddedEventHandlerProps extends NodejsFunctionProps {
  database: Database;
}

export class RewardAddedEventHandler extends NodejsFunction {
  constructor(scope: Construct, id: string, props: RewardAddedEventHandlerProps) {
    super(scope, id, {
      entry: path.join(__dirname, `./functions/reward-added-event-handler/index.ts`),
      environment: {
        // AWS_RESOURCE_GRAPHQL_WEBSOCKET_CONNECTIONS_TABLE: props.database.websocketConnections.table.tableName,
        IS_LOCAL: 'true',
        LOG_PRETTY_PRINT: 'true',
      },
      ...props,
    });

    // props.database.websocketConnections.table.grantReadWriteData(this);
  }
}
