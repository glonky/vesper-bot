import path from 'node:path';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { BaseConfig } from '@vesper-discord/config';
import { Container } from 'typedi';
import { Duration } from 'aws-cdk-lib';
import { Schedule, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Database } from '../shared-resources/database';
import { CustomVpc } from '../shared-resources/vpc';
import { RedisCache } from '../shared-resources/redis-cache';

export interface RewardAddedObserverProps {
  database: Database;
  vpc: CustomVpc;
  redisCache: RedisCache;
  securityGroup: SecurityGroup;
}

export class RewardAddedObserver extends Construct {
  public readonly function: NodejsFunction;

  constructor(scope: Construct, id: string, props: RewardAddedObserverProps) {
    super(scope, id);

    const envVars = Container.get(BaseConfig).loadDotEnvFilesForAwsDeploy();

    this.function = new NodejsFunction(this, 'Function', {
      architecture: Architecture.ARM_64,
      bundling: {
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
      },
      deadLetterQueueEnabled: true,
      entry: path.join(__dirname, `./functions/reward-added-observer/index.ts`),
      environment: {
        ...envVars,
        AWS_RESOURCE_VESPER_SINGLE_TABLE: props.database.vesperSingleTable.table.tableName,
        REDIS_TLS_URL: props.redisCache.cluster.attrRedisEndpointAddress,
      },
      memorySize: 256,
      runtime: Runtime.NODEJS_16_X,
      securityGroups: [props.securityGroup],
      timeout: Duration.minutes(1),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_NAT,
      },
    });

    this.node.addDependency(props.redisCache);

    props.database.vesperSingleTable.table.grantReadWriteData(this.function);

    const lambdaFunctionTarget = new LambdaFunction(this.function);

    const schedule = Schedule.rate(Duration.minutes(30));

    new Rule(this, 'RewardAddedObserverScheduleRule', {
      schedule,
      targets: [lambdaFunctionTarget],
    });
  }
}
