import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { RewardAddedObserver } from '../reward-added-observer';
import { CustomVpc } from '../../shared-resources/vpc';
import { Database } from '../../shared-resources/database';
import { RedisCache } from '../../shared-resources/redis-cache';
import { SecurityGroups } from '../../shared-resources/security-groups';

describe('BlockchainObserverStack | Construct | RewardAddedObserver', () => {
  describe('Lambda', () => {
    test('it has the correct resources', () => {
      const app = new cdk.App();
      const stack = new Stack(app, 'Stack', {
        env: {
          account: '702592220884',
          region: 'us-west-2',
        },
      });
      const vpc = new CustomVpc(stack, 'Vpc');
      const securityGroup = new SecurityGroups(stack, 'SecurityGroups', {
        vpc,
      });

      const database = new Database(stack, 'Database');
      const redisCache = new RedisCache(stack, 'RedisCache', {
        securityGroup: securityGroup.redisCacheSecurityGroup,
        vpc,
      });
      new RewardAddedObserver(stack, 'RewardAddedObserver', {
        database,

        redisCache,
        securityGroup: securityGroup.lambdaSecurityGroup,
        vpc,
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::DynamoDB::Table', 0);
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
