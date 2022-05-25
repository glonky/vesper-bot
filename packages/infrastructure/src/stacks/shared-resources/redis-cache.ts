import { Construct } from 'constructs';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnSubnetGroup } from 'aws-cdk-lib/aws-elasticache';
import { CustomVpc } from './vpc';

export interface RedisCacheProps {
  vpc: CustomVpc;
  securityGroup: SecurityGroup;
}

export class RedisCache extends Construct {
  public readonly cluster: elasticache.CfnCacheCluster;

  constructor(scope: Construct, id: string, { vpc, securityGroup }: RedisCacheProps) {
    super(scope, id);

    const privateSubnets = vpc.privateSubnets.map((subnet) => subnet.subnetId);

    const subnetGroup = new CfnSubnetGroup(this, 'SubnetGroup', {
      description: 'Subnet group for redis',
      subnetIds: privateSubnets,
    });

    this.cluster = new elasticache.CfnCacheCluster(this, 'Cluster', {
      autoMinorVersionUpgrade: true,
      cacheNodeType: 'cache.t2.micro',
      cacheParameterGroupName: 'default.redis6.x',
      cacheSubnetGroupName: subnetGroup.ref,
      engine: 'redis',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [securityGroup.securityGroupId],
    });

    this.cluster.addDependsOn(subnetGroup);
  }
}
