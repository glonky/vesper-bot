import {
  BastionHostLinux,
  BlockDeviceVolume,
  InstanceClass,
  InstanceSize,
  InstanceType,
  SecurityGroup,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CustomVpc } from './vpc';

export interface BastionHostProps {
  vpc: CustomVpc;
  securityGroup: SecurityGroup;
}

export class BastionHost extends Construct {
  public readonly host: BastionHostLinux;

  constructor(scope: Construct, id: string, props: BastionHostProps) {
    super(scope, id);

    this.host = new BastionHostLinux(this, 'BastionHost', {
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: BlockDeviceVolume.ebs(15),
        },
      ],
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      securityGroup: props.securityGroup,
      subnetSelection: { subnetType: SubnetType.PUBLIC },
      vpc: props.vpc,
    });

    this.host.instance.instance.addPropertyOverride('KeyName', `bastion-host-key-pair`);
  }
}
