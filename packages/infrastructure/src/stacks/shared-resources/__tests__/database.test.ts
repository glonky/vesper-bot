import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { Database } from '../database';

describe('SharedResourcesStack | Construct | Database', () => {
  describe('DynamoDB Tables', () => {
    test('it has the correct resources', () => {
      const app = new cdk.App();
      const stack = new Stack(app, 'Stack');
      new Database(stack, 'Database');

      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::DynamoDB::Table', 1);
    });

    test('it sets retention policy to Retain', () => {
      const app = new cdk.App();
      const stack = new Stack(app, 'Stack');
      new Database(stack, 'Database');

      const template = Template.fromStack(stack);

      template.hasResource('AWS::DynamoDB::Table', {
        DeletionPolicy: 'Retain',
        UpdateReplacePolicy: 'Retain',
      });
    });

    test('it sets the correct properties', () => {
      const app = new cdk.App();
      const stack = new Stack(app, 'Stack');
      new Database(stack, 'Database');

      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::Table', {
        AttributeDefinitions: [
          {
            AttributeName: 'pk',
            AttributeType: 'S',
          },
          {
            AttributeName: 'sk',
            AttributeType: 'S',
          },
          {
            AttributeName: 'gsi2pk',
            AttributeType: 'S',
          },
          {
            AttributeName: 'gsi2sk',
            AttributeType: 'S',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
        ContributorInsightsSpecification: {
          Enabled: true,
        },
        GlobalSecondaryIndexes: [
          {
            IndexName: 'gsi1',
            KeySchema: [
              {
                AttributeName: 'sk',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'pk',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
          {
            IndexName: 'gsi2',
            KeySchema: [
              {
                AttributeName: 'gsi2pk',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'gsi2sk',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ],
        KeySchema: [
          {
            AttributeName: 'pk',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'sk',
            KeyType: 'RANGE',
          },
        ],
        SSESpecification: {
          SSEEnabled: true,
        },
        TimeToLiveSpecification: {
          AttributeName: 'ttl',
          Enabled: true,
        },
      });
    });
  });
});
