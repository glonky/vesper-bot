import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Database } from '../shared-resources/database';
import { RewardAddedEventHandler } from './reward-added-event-handler';

export interface BlockchainObserverStackProps extends StackProps {
  database: Database;
}

export class BlockchainObserverStack extends Stack {
  constructor(scope: Construct, id: string, props: BlockchainObserverStackProps) {
    super(scope, id, props);

    new RewardAddedEventHandler(this, 'RewardAddedEventHandler', {
      database: props.database,
    });

    // TODO: Fargate for observer.
    //    Then publish to Event Bridge
    // EventBridge to Lambda
  }
}
