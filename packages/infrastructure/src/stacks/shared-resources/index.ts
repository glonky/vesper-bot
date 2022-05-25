import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BastionHost } from './bastion-host';
import { Database } from './database';
import { RedisCache } from './redis-cache';
import { SecurityGroups } from './security-groups';
import { User } from './user';
import { CustomVpc } from './vpc';

export class SharedResourcesStack extends Stack {
  public readonly database: Database;

  public readonly redisCache: RedisCache;

  public readonly bastionHost: BastionHost;

  public readonly vpc: CustomVpc;

  public readonly securityGroups: SecurityGroups;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.vpc = new CustomVpc(this, 'Vpc');

    this.securityGroups = new SecurityGroups(this, 'SecurityGroups', {
      vpc: this.vpc,
    });

    this.bastionHost = new BastionHost(this, 'BastionHost', {
      securityGroup: this.securityGroups.bastionHostSecurityGroup,
      vpc: this.vpc,
    });

    this.database = new Database(this, 'Database');

    const integrationTestUser = new User(this, 'IntegrationTestUser');
    const devUser = new User(this, 'DevUser', {
      createAccessKey: true,
    });

    this.database.vesperSingleTable.table.grantReadWriteData(integrationTestUser);
    this.database.vesperSingleTable.table.grantReadWriteData(devUser);
    this.redisCache = new RedisCache(this, 'RedisCache', {
      securityGroup: this.securityGroups.redisCacheSecurityGroup,
      vpc: this.vpc,
    });
  }
}
