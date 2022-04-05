import {
  Vpc,
  SubnetType,
  SubnetConfiguration,
  NatProvider,
  InstanceType,
  InstanceClass,
  InstanceSize,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface CustomVpcProps {
  disablePublicSubnet?: boolean;
}

export class CustomVpc extends Construct {
  public readonly vpc: Vpc;

  // public readonly sharedInboundAndOutboundSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props?: CustomVpcProps) {
    super(scope, id);
    let subnetConfiguration: SubnetConfiguration[] | undefined;
    let natGateways = 1;

    if (props?.disablePublicSubnet) {
      subnetConfiguration = [
        {
          cidrMask: 26,
          name: 'isolatedSubnet',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ];
      natGateways = 0;
    }

    this.vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGatewayProvider: NatProvider.instance({
        instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      }),
      natGateways,
      subnetConfiguration,
    });

    // this.sharedInboundAndOutboundSecurityGroup = new SecurityGroup(this, `SharedInboundAndOutboundSecurityGroup`, {
    //   allowAllOutbound: true,
    //   securityGroupName: 'SharedInboundAndOutboundSecurityGroup',
    //   vpc: this.vpc,
    // });

    // this.sharedInboundAndOutboundSecurityGroup.connections.allowFromAnyIpv4(Port.allTraffic());
  }
}
