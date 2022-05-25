import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Database } from '../shared-resources/database';
import { RedisCache } from '../shared-resources/redis-cache';
import { SecurityGroups } from '../shared-resources/security-groups';
import { CustomVpc } from '../shared-resources/vpc';
import { RewardAddedEventHandler } from './reward-added-event-handler';
import { RewardAddedObserver } from './reward-added-observer';

export interface BlockchainObserverStackProps extends StackProps {
  database: Database;
  vpc: CustomVpc;
  redisCache: RedisCache;
  securityGroups: SecurityGroups;
}

export class BlockchainObserverStack extends Stack {
  constructor(scope: Construct, id: string, props: BlockchainObserverStackProps) {
    super(scope, id, props);

    new RewardAddedEventHandler(this, 'RewardAddedEventHandler', {
      database: props.database,
      securityGroup: props.securityGroups.lambdaSecurityGroup,
    });

    new RewardAddedObserver(this, 'RewardAddedObserver', {
      database: props.database,
      redisCache: props.redisCache,
      securityGroup: props.securityGroups.lambdaSecurityGroup,
      vpc: props.vpc,
    });
  }
}
