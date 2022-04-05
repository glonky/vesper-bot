import '@vesper-discord/config';
import { App, StackProps } from 'aws-cdk-lib';
import { Container } from 'typedi';
import { Config } from './config';
import { SharedResourcesStack } from './stacks/shared-resources';
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

    // new BlockchainObserverStack(this, `BlockchainObserverStack`, {
    //   ...stackProps,
    //   database: this.sharedResourcesStack.database,
    //   stackName: `BlockchainObserverStack`,
    // });
  }
}
