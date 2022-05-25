import {
  Vpc,
  SecurityGroup,
  InstanceClass,
  InstanceSize,
  InstanceType,
  NatProvider,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class CustomVpc extends Vpc {
  public readonly sharedOutboundSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id, {
      maxAzs: 2,
      natGatewayProvider: NatProvider.instance({
        instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      }),
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
        {
          name: 'public-subnet-1',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    // this.addFlowLog('FlowLog');

    this.sharedOutboundSecurityGroup = new SecurityGroup(this, `SharedOutboundSecurityGroup`, {
      allowAllOutbound: true,
      vpc: this,
    });
  }
}
