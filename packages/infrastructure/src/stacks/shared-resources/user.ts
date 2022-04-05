import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { User as IamUser, CfnAccessKey } from 'aws-cdk-lib/aws-iam';
import { CfnSecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface UserProps {
  createAccessKey?: boolean;
}

export class User extends IamUser {
  constructor(scope: Construct, id: string, props?: UserProps) {
    super(scope, id);

    if (props?.createAccessKey) {
      // Access Key for the user
      const accessKey = new CfnAccessKey(this, 'AccessKey', {
        userName: this.userName,
      });

      // Secret for the user will be stored in secret manager
      const secret = new CfnSecret(this, 'SecretAccessKey', {
        secretString: String(accessKey.getAtt('SecretAccessKey')),
      });

      secret.applyRemovalPolicy(RemovalPolicy.DESTROY);

      /** ********************************* List of Outputs *********************************** */
      new CfnOutput(this, 'ArnOutput', {
        value: this.userArn,
      });

      new CfnOutput(this, 'AccessKeyOutput', {
        value: accessKey.ref,
      });

      new CfnOutput(this, 'SecretAccessKeyOutput', {
        value: secret.ref,
      });
      /** ************************************************************************************* */
    }
  }
}
