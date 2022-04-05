import { Template } from 'aws-cdk-lib/assertions';
import { VesperDiscordApp } from '../app';

describe('Infrastructure | App', () => {
  it.skip('has the correct outputs', () => {
    const app = new VesperDiscordApp();
    const template = Template.fromStack(app.sharedResourcesStack);

    template.hasOutput('*', {
      Export: {
        Name: 'SharedResourcesStack:ExportsOutputFnGetAttDatabaseGraphQLWebsocketConnectionsTable7D429A54Arn2194E920',
      },
      Value: {
        'Fn::GetAtt': ['DatabaseGraphQLWebsocketConnectionsTable7D429A54', 'Arn'],
      },
    });
  });
});
