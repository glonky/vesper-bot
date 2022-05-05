import { Construct } from 'constructs';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { CustomVpc } from './vpc';

export interface RedisCacheProps extends Partial<elasticache.CfnCacheClusterProps> {
  vpc: CustomVpc;
}

export class RedisCache extends elasticache.CfnCacheCluster {
  constructor(scope: Construct, id: string, { vpc, ...props }: RedisCacheProps) {
    super(scope, id, {
      ...props,
      cacheNodeType: 'cache.t3.micro',
      cacheParameterGroupName: 'default.redis6.x',
      engine: 'redis',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [vpc.defaultSecurityGroup.securityGroupId],
    });
  }
}
