import path from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import { AwsLogDriver, Cluster, ContainerImage, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { CustomVpc } from '../shared-resources/vpc';

export interface CommandBotStackProps extends StackProps {
  vpc: CustomVpc;
}

export class CommandBotStack extends Stack {
  constructor(scope: Construct, id: string, props: CommandBotStackProps) {
    super(scope, id, props);

    const cluster = new Cluster(this, 'Cluster', { vpc: props.vpc });

    // create a task definition with CloudWatch Logs
    const logging = new AwsLogDriver({
      streamPrefix: 'command-bot',
    });

    const taskDef = new FargateTaskDefinition(this, 'MyTaskDefinition', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    taskDef.addContainer('AppContainer', {
      image: ContainerImage.fromAsset(path.resolve(__dirname, '../../../../..')),
      logging,
    });

    // Instantiate ECS Service with just cluster and image
    new FargateService(this, 'FargateService', {
      cluster,
      taskDefinition: taskDef,
    });
  }
}
