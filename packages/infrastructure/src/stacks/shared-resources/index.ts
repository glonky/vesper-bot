import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Database } from './database';
import { User } from './user';

export class SharedResourcesStack extends Stack {
  public database: Database;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.database = new Database(this, 'Database');

    const integrationTestUser = new User(this, 'IntegrationTestUser');
    const devUser = new User(this, 'DevUser', {
      createAccessKey: true,
    });

    this.database.vesperSingleTable.table.grantReadWriteData(integrationTestUser);
    this.database.vesperSingleTable.table.grantReadWriteData(devUser);
  }
}
