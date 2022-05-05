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
            AttributeName: 'GSI2pk',
            AttributeType: 'S',
          },
          {
            AttributeName: 'GSI2sk',
            AttributeType: 'S',
          },
          {
            AttributeName: 'GSI3pk',
            AttributeType: 'S',
          },
          {
            AttributeName: 'GSI3sk',
            AttributeType: 'S',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
        ContributorInsightsSpecification: {
          Enabled: true,
        },
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
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
            IndexName: 'GSI2',
            KeySchema: [
              {
                AttributeName: 'GSI2pk',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'GSI2sk',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
          {
            IndexName: 'GSI3',
            KeySchema: [
              {
                AttributeName: 'GSI3pk',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'GSI3sk',
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
        StreamSpecification: {
          StreamViewType: 'NEW_AND_OLD_IMAGES',
        },
        TimeToLiveSpecification: {
          AttributeName: 'ttl',
          Enabled: true,
        },
      });
    });
  });
});
