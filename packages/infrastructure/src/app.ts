import '@vesper-discord/config';
import { App, StackProps } from 'aws-cdk-lib';
import { Container } from 'typedi';
import { Config } from './config';
import { BlockchainObserverStack } from './stacks/blockchain-observer/index';
import { CommandBotStack } from './stacks/command-bot';
import { SharedResourcesStack } from './stacks/shared-resources/index';
// import { BlockchainObserverStack } from './stacks/blockchain-observer';

export class VesperDiscordApp extends App {
  public readonly sharedResourcesStack: SharedResourcesStack;

  constructor() {
    super();
    const config = Container.get(Config);
    const {
      aws: { stage, account, region },
    } = config;
    const stackProps: StackProps = {
      env: {
        account,
        region,
      },
    };

    this.sharedResourcesStack = new SharedResourcesStack(this, `SharedResourcesStack`, {
      ...stackProps,
      stackName: `SharedResourcesStack`,
    });

    new BlockchainObserverStack(this, `BlockchainObserverStack`, {
      ...stackProps,
      database: this.sharedResourcesStack.database,
      redisCache: this.sharedResourcesStack.redisCache,
      securityGroups: this.sharedResourcesStack.securityGroups,
      stackName: `BlockchainObserverStack`,
      vpc: this.sharedResourcesStack.vpc,
    });

    new CommandBotStack(this, 'CommandBotStack', {
      ...stackProps,
      stackName: `CommandBotStack`,
      vpc: this.sharedResourcesStack.vpc,
    });
  }
}
