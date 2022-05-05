import path from 'node:path';
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { BaseConfig } from '@vesper-discord/config';
import { Container } from 'typedi';
import { Duration } from 'aws-cdk-lib';
import { Schedule, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Database } from '../shared-resources/database';

export interface RewardAddedObserverProps extends NodejsFunctionProps {
  database: Database;
}

export class RewardAddedObserver extends NodejsFunction {
  constructor(scope: Construct, id: string, props: RewardAddedObserverProps) {
    const envVars = Container.get(BaseConfig).loadDotEnvFilesForAwsDeploy();

    super(scope, id, {
      bundling: {
        sourceMap: true,
        sourceMapMode: SourceMapMode.BOTH,
      },
      entry: path.join(__dirname, `./functions/reward-added-observer/index.ts`),
      environment: {
        ...envVars,
        AWS_RESOURCE_VESPER_SINGLE_TABLE: props.database.vesperSingleTable.table.tableName,
      },
      memorySize: 256,
      timeout: Duration.minutes(5),
      ...props,
    });

    props.database.vesperSingleTable.table.grantReadWriteData(this);

    const lambdaFunctionTarget = new LambdaFunction(this);

    const schedule = Schedule.rate(Duration.minutes(5));

    new Rule(this, 'RewardAddedObserverScheduleRule', {
      schedule,
      targets: [lambdaFunctionTarget],
    });
  }
}
