import { Vpc, SubnetType, SubnetConfiguration, SecurityGroup, IVpc, ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface CustomVpcProps {
  disablePublicSubnet?: boolean;
}

export class CustomVpc extends Construct {
  public readonly vpc: IVpc;

  public readonly defaultSecurityGroup: ISecurityGroup;

  public readonly sharedOutboundSecurityGroup: SecurityGroup;

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

    this.vpc = Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });

    this.defaultSecurityGroup = SecurityGroup.fromLookupByName(this, 'DefaultSecurityGroup', 'default', this.vpc);

    this.sharedOutboundSecurityGroup = new SecurityGroup(this, `SharedOutboundSecurityGroup`, {
      allowAllOutbound: true,
      vpc: this.vpc,
    });

    // this.sharedInboundAndOutboundSecurityGroup.connections.allowFromAnyIpv4(Port.allTraffic());
  }
}
