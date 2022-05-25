import { StackProps } from 'aws-cdk-lib';
import { Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CustomVpc } from './vpc';

export interface SecurityGroupsProps extends StackProps {
  vpc: CustomVpc;
}

export class SecurityGroups extends Construct {
  public readonly bastionHostSecurityGroup: SecurityGroup;

  public readonly lambdaSecurityGroup: SecurityGroup;

  public readonly redisCacheSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityGroupsProps) {
    super(scope, id);

    this.bastionHostSecurityGroup = new SecurityGroup(this, 'BastionHostSecurityGroup', {
      allowAllOutbound: true,
      vpc: props.vpc,
    });

    this.lambdaSecurityGroup = new SecurityGroup(this, 'LambdaSecurityGroup', {
      allowAllOutbound: true,
      vpc: props.vpc,
    });

    this.redisCacheSecurityGroup = new SecurityGroup(this, 'RedisCacheSecurityGroup', {
      allowAllOutbound: true,
      vpc: props.vpc,
    });
    this.lambdaSecurityGroup = this.redisCacheSecurityGroup;

    this.bastionHostSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'SSH access');

    this.redisCacheSecurityGroup.addIngressRule(
      this.bastionHostSecurityGroup,
      Port.tcp(6379),
      'Access from bastion host',
    );
    this.redisCacheSecurityGroup.addIngressRule(this.lambdaSecurityGroup, Port.tcp(6379), 'Access from lambda');
    this.lambdaSecurityGroup.addEgressRule(this.redisCacheSecurityGroup, Port.tcp(6379), 'Access from lambda');
  }
}
