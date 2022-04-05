import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { User } from '../user';

describe('SharedResourcesStack | Construct | User', () => {
  describe('User', () => {
    test('it has the correct resources', () => {
      const app = new cdk.App();
      const stack = new Stack(app, 'Stack');
      new User(stack, 'User');

      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::IAM::User', 1);
    });
  });

  describe('AccessKey', () => {
    describe('createAccessKey = true', () => {
      test('it has the correct resources', () => {
        const app = new cdk.App();
        const stack = new Stack(app, 'Stack');
        new User(stack, 'User', {
          createAccessKey: true,
        });

        const template = Template.fromStack(stack);
        template.resourceCountIs('AWS::IAM::AccessKey', 1);
        template.resourceCountIs('AWS::SecretsManager::Secret', 1);
      });

      test('it sets the correct properties', () => {
        const app = new cdk.App();
        const stack = new Stack(app, 'Stack');
        new User(stack, 'User', {
          createAccessKey: true,
        });

        const template = Template.fromStack(stack);
        const userAccessKey = template.findResources('AWS::IAM::AccessKey');
        template.hasResource('AWS::SecretsManager::Secret', {
          DeletionPolicy: 'Delete',
        });

        template.hasResourceProperties('AWS::SecretsManager::Secret', {
          SecretString: {
            'Fn::GetAtt': [Object.keys(userAccessKey)[0], 'SecretAccessKey'],
          },
        });
      });

      test('it has the correct outputs', () => {
        const app = new cdk.App();
        const stack = new Stack(app, 'Stack');
        new User(stack, 'User', {
          createAccessKey: true,
        });

        const template = Template.fromStack(stack);

        const accessKeyResource = template.findResources('AWS::IAM::AccessKey');

        template.hasOutput('*', { Value: { Ref: Object.keys(accessKeyResource)[0] } });

        const secretResource = template.findResources('AWS::SecretsManager::Secret');

        template.hasOutput('*', { Value: { Ref: Object.keys(secretResource)[0] } });
      });
    });

    describe('createAccessKey = false', () => {
      test('it has the correct resources', () => {
        const app = new cdk.App();
        const stack = new Stack(app, 'Stack');
        new User(stack, 'User', {
          createAccessKey: false,
        });

        const template = Template.fromStack(stack);
        template.resourceCountIs('AWS::IAM::AccessKey', 0);
        template.resourceCountIs('AWS::SecretsManager::Secret', 0);
      });
    });
  });
});
