import path from 'node:path';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Architecture, Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource, SqsDlq } from 'aws-cdk-lib/aws-lambda-event-sources';
import { BaseConfig } from '@vesper-discord/config';
import { Container } from 'typedi';
import { Duration } from 'aws-cdk-lib';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';

import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Database } from '../shared-resources/database';

export interface RewardAddedEventHandlerProps {
  database: Database;
  securityGroup: SecurityGroup;
}

export class RewardAddedEventHandler extends NodejsFunction {
  constructor(scope: Construct, id: string, props: RewardAddedEventHandlerProps) {
    const envVars = Container.get(BaseConfig).loadDotEnvFilesForAwsDeploy();

    super(scope, id, {
      architecture: Architecture.ARM_64,
      bundling: {
        externalModules: ['sharp'],
        forceDockerBundling: true,
        nodeModules: ['sharp'],
        sourceMap: true,
        sourceMapMode: SourceMapMode.BOTH,
      },
      deadLetterQueueEnabled: true,
      entry: path.join(__dirname, `./functions/reward-added-event-handler/index.ts`),
      environment: {
        ...envVars,
        AWS_RESOURCE_VESPER_SINGLE_TABLE: props.database.vesperSingleTable.table.tableName,
      },
      memorySize: 256,
      runtime: Runtime.NODEJS_16_X,
      securityGroups: [props.securityGroup],
      timeout: Duration.seconds(30),
    });

    props.database.vesperSingleTable.table.grantReadWriteData(this);
    const deadLetterQueue = new Queue(this, 'DynamoEventSourceDLQ');

    this.addEventSource(
      new DynamoEventSource(props.database.vesperSingleTable.table, {
        batchSize: 5,
        bisectBatchOnError: true,
        onFailure: new SqsDlq(deadLetterQueue),
        retryAttempts: 2,
        startingPosition: StartingPosition.LATEST,
      }),
    );
  }
}
