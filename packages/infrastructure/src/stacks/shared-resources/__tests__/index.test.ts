import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SharedResourcesStack } from '..';

describe('SharedResourcesStack | Stack', () => {
  it('has the correct resources', () => {
    const app = new App();
    const stack = new SharedResourcesStack(app, 'Stack', {});
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::IAM::User', 2);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });

  it('assigns the correct permissions for the users', () => {
    const app = new App();
    const stack = new SharedResourcesStack(app, 'Stack', {});
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::IAM::Policy', 2);
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: [
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:ConditionCheckItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:DescribeTable',
            ],
            Effect: 'Allow',
            Resource: [
              {
                'Fn::GetAtt': ['DatabaseVesperSingleTable00BF6414', 'Arn'],
              },
              { 'Fn::Join': ['', [{ 'Fn::GetAtt': ['DatabaseVesperSingleTable00BF6414', 'Arn'] }, '/index/*']] },
            ],
          },
        ],
        Version: '2012-10-17',
      },
      PolicyName: 'DevUserDefaultPolicyD940654B',
      Users: [
        {
          Ref: 'DevUser3630C3BB',
        },
      ],
    });

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: [
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:ConditionCheckItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:DescribeTable',
            ],
            Effect: 'Allow',
            Resource: [
              {
                'Fn::GetAtt': ['DatabaseVesperSingleTable00BF6414', 'Arn'],
              },
              { 'Fn::Join': ['', [{ 'Fn::GetAtt': ['DatabaseVesperSingleTable00BF6414', 'Arn'] }, '/index/*']] },
            ],
          },
        ],
        Version: '2012-10-17',
      },
      PolicyName: 'IntegrationTestUserDefaultPolicyBCC8DE4A',
      Users: [
        {
          Ref: 'IntegrationTestUserED4468A0',
        },
      ],
    });
  });
});
